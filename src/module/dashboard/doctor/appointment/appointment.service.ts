import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from 'src/database/entities/doctor.entity';
import { LoggerService } from 'src/module/logger/logger.service';
import { DataSource, IsNull, Not, type Repository } from 'typeorm';
import type {
  CheckAppointmentDTO,
  CurrentAppointmentDTO,
} from './model/appointment.dto';
import { Staff } from 'src/database/entities/staff.entity';
import { ResponseError } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';
import {
  Appointment,
  AppointmentStatus,
} from 'src/database/entities/appointment.entitity';
import { Schedule } from 'src/database/entities/schedule.entity';
import * as dayjs from 'dayjs';
import { CashierQueue } from 'src/database/entities/cashierqueue.entity';

@Injectable()
export class AppointmentDoctorService {
  constructor(
    private log: LoggerService,
    private readonly dataSource: DataSource,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(CashierQueue)
    private readonly cashierQueueRepository: Repository<CashierQueue>,
  ) {}

  async getDetailCurrentAppointment(body: CurrentAppointmentDTO) {
    const doctorId = await this.dataSource.query(
      `
        SELECT doctor_id FROM staff WHERE id = $1
      `,
      [body.user.id],
    );

    if (doctorId.length !== 1) {
      throw new ResponseError(
        'User Logged In is not doctor',
        StatusCodes.BAD_REQUEST,
      );
    }

    if (doctorId[0].doctor_id === null) {
      throw new ResponseError(
        'User Logged In is not doctor',
        StatusCodes.BAD_REQUEST,
      );
    }

    const schedule = await this.scheduleRepository.find({
      where: {
        date: new Date(),
        status: 'ready',
      },
    });

    if (schedule.length === 0) {
      return null;
    }

    const now = dayjs();

    const { schedule: closestSchedule } = schedule.reduce(
      (closest, schedule) => {
        const scheduleTime = dayjs(`${schedule.date} ${schedule.startTime}`);
        const diff = Math.abs(now.diff(scheduleTime));

        if (!closest || diff < closest.diff) {
          return { schedule, diff };
        }

        return closest;
      },
      null as { schedule: Schedule; diff: number } | null,
    );

    const scheduleId = closestSchedule.id;

    const scheduleDetail = (await this.dataSource.query(
      `
        SELECT
            COUNT(*) as total,
            COUNT(CASE WHEN a.finish_time IS NOT NULL THEN 1 END) as totalfinished,
            COUNT(CASE WHEN a.finish_time IS NULL THEN 1 END) as totalwaiting
        FROM
            appointment a
        WHERE
            a.appointment_status = 'doctor queue' AND a.schedule_id = $1
      `,
      [scheduleId],
    )) as Array<{ total: number; totalfinished: number; totalwaiting: number }>;

    const currentDoctorQueue = (await this.dataSource.query(
      `
        SELECT
            dq.queue_number
        FROM
            appointment a
        JOIN
            doctor_queue dq ON a.doctor_queue_id = dq.id
        WHERE
            a.schedule_id = $1 AND
            a.appointment_status = 'doctor queue' AND
            a.pharmacy_queue_id IS NOT NULL
        ORDER BY
            dq.queue_number DESC
        LIMIT 1
      `,
      [scheduleId],
    )) as Array<{ queue_number: string }>;

    let doctorQueueNumber = 1;

    if (currentDoctorQueue.length === 1) {
      doctorQueueNumber = Number(currentDoctorQueue[0].queue_number);
    }

    return {
      scheduleId,
      total: Number(scheduleDetail[0].total),
      totalFinished: Number(scheduleDetail[0].totalfinished),
      totalWaiting: Number(scheduleDetail[0].totalwaiting),
      scheduleDetail: {
        ...closestSchedule,
        startTime: closestSchedule.startTime.substring(0, 5),
        endTime: closestSchedule.endTime.substring(0, 5),
      },
      currentQueueNumber: doctorQueueNumber,
    };
  }

  async getListAppointment({
    pageNumber,
    pageSize,
  }: {
    pageNumber: number;
    pageSize: number;
  }) {
    const [data, count] = await this.appointmentRepository.findAndCount({
      where: {
        appointmentStatus: AppointmentStatus.DOCTORQUEUE,
        doctorQueue: Not(IsNull()),
      },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      relations: {
        patient: true,
        doctorQueue: true,
        medicalRecord: true,
      },
      order: {
        doctorQueue: {
          queueNumber: 'ASC',
        },
      },
    });

    return {
      totalRows: count,
      list: data,
    };
  }

  async checkAppointment(body: CheckAppointmentDTO) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: body.appointmentId },
      relations: {
        medicalRecord: true,
        doctorQueue: true,
        schedule: {
          doctor: true,
        },
      },
    });

    if (!appointment) {
      throw new ResponseError('Appointment not found', StatusCodes.NOT_FOUND);
    }

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      await queryRunner.startTransaction();

      appointment.medicalRecord.diagnosisDoctor = body.diagnosis;
      appointment.medicalRecord.prescription = body.resepDokter;

      appointment.doctorQueue.finishTime = new Date();

      await queryRunner.manager.save(appointment.medicalRecord);

      await queryRunner.manager.save(appointment.doctorQueue);

      appointment.notes = body.notes;
      appointment.appointmentStatus = AppointmentStatus.CASHIERQUEUE;

      const cashierQueueLatest = await this.cashierQueueRepository.findOne({
        select: ['id', 'queueNumber'],
        order: {
          queueNumber: 'DESC',
        },
        where: {
          date: new Date(),
        },
      });

      const cashierQueue = new CashierQueue();

      cashierQueue.date = new Date();
      cashierQueue.startTime = new Date();

      cashierQueue.queueNumber = cashierQueueLatest.queueNumber + 1;

      await queryRunner.manager.save(cashierQueue);

      appointment.cashierQueue = cashierQueue;

      await queryRunner.manager.save(appointment);

      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }

    return appointment;
  }
}
