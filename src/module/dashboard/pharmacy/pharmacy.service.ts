import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggerService } from 'src/module/logger/logger.service';
import { DataSource, IsNull, Not, type Repository } from 'typeorm';
import type {
  PharmacyUpdateDTO
} from './model/pharmacy.dto';
import { ResponseError } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';
import {
  Appointment,
  AppointmentStatus,
} from 'src/database/entities/appointment.entitity';
import { CashierQueue } from 'src/database/entities/cashierqueue.entity';

@Injectable()
export class PharmacyService {
  constructor(
    private log: LoggerService,
    private readonly dataSource: DataSource,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(CashierQueue)
    private readonly cashierQueueRepository: Repository<CashierQueue>,
  ) {}

  async getDetailCurrentQueue() {
    const date = new Date();

    const scheduleDetail = (await this.dataSource.query(
      `
        SELECT
            COUNT(*) as total,
            COUNT(CASE WHEN a.appointment_status != 'pharmacy queue' THEN 1 END) as totalfinished,
            COUNT(CASE WHEN a.appointment_status = 'pharmacy queue' THEN 1 END) as totalwaiting
        FROM
            appointment a
        JOIN
            pharmacy_queue pq ON a.pharmacy_queue_id = pq.id
        WHERE
            a.appointment_status IN ('pharmacy queue', 'cashier queue', 'done') AND pq.date = $1
      `,
      [date],
    )) as Array<{ total: number; totalfinished: number; totalwaiting: number }>;

    return {
      total: Number(scheduleDetail[0].total),
      totalFinished: Number(scheduleDetail[0].totalfinished),
      totalWaiting: Number(scheduleDetail[0].totalwaiting),
    };
  }

  async getPharmacyQueue({
    pageNumber,
    pageSize,
  }: {
    pageNumber: number;
    pageSize: number;
  }) {
    const date = new Date();

    const [data, count] = await this.appointmentRepository.findAndCount({
      where: {
        appointmentStatus: AppointmentStatus.PHARMACYQUEUE,
        pharmacyQueue: {
          date: date,
        },
      },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      relations: {
        patient: true,
        pharmacyQueue: true,
        medicalRecord: true,
        schedule: {
          room: true,
          doctor: true,
        },
      },
      order: {
        pharmacyQueue: {
          queueNumber: 'ASC',
        },
      },
    });

    return {
      totalRows: count,
      list: data,
    };
  }

  async updatePharmacyQueue(body: PharmacyUpdateDTO) {

    const appointment = await this.appointmentRepository.findOne({
      where: { id: body.appointmentId },
      relations: {
        pharmacyQueue: true,
      },
    });

    if (!appointment) {
      throw new ResponseError('Appointment not found', StatusCodes.NOT_FOUND);
    }

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      await queryRunner.startTransaction();

      appointment.pharmacyFee = body.pharmacyFee;
      appointment.pharmacyQueue.finishTime = new Date();

      await queryRunner.manager.save(appointment);

      await queryRunner.manager.save(appointment.pharmacyQueue);

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

      cashierQueue.queueNumber = (cashierQueueLatest?.queueNumber ?? 0) + 1;

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
