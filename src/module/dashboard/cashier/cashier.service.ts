import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import { StatusCodes } from 'http-status-codes';
import {
  Appointment,
  AppointmentStatus,
} from 'src/database/entities/appointment.entitity';
import { CashierQueue } from 'src/database/entities/cashierqueue.entity';
import { LoggerService } from 'src/module/logger/logger.service';
import { ResponseError } from 'src/utils/api.utils';
import { DataSource, IsNull, Repository } from 'typeorm';
import { UpdateCashierDTO } from './model/cashier.dto';

@Injectable()
export class CashierService {
  constructor(
    private log: LoggerService,
    private readonly dataSource: DataSource,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(CashierQueue)
    private readonly cashierQueueRepository: Repository<CashierQueue>,
  ) {}

  async getTotalCashierQueue() {
    const data = (await this.dataSource.query(
      `select
        count(*) as total,
        count(case when cq.finish_time is null then 1 end) as totalWaiting,
        count(case when cq.finish_time notnull then 1 end) as totalFinished
      from appointment app
      join cashier_queue cq ON app.cashier_queue_id = cq.id
      where appointment_status IN ('pharmacy queue', 'cashier queue', 'done') and cashier_queue_id notnull and cq."date" = $1 `,
      [dayjs().format('YYYY-MM-DD')],
    )) as Array<{ total: number; totalWaiting: number; totalFinished: number }>;

    return data[0];
  }

  async getCashierQueue(pageSize: number, pageNumber: number) {
    const [data, count] = await this.appointmentRepository.findAndCount({
      relations: {
        cashierQueue: true,
        patient: true,
        schedule: {
          room: true,
          doctor: {
            specialization: true,
          },
        },
      },
      where: {
        appointmentStatus: AppointmentStatus.CASHIERQUEUE,
        cashierQueue: {
          date: new Date(),
          finishTime: IsNull(),
        },
      },
      order: {
        cashierQueue: {
          queueNumber: 'ASC',
        },
      },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });

    return {
      totalRows: count,
      list: data,
    };
  }

  async updateCashierQueue(req: UpdateCashierDTO) {
    const appointment = await this.appointmentRepository.findOne({
      where: {
        id: req.bookingId,
      },
      relations: {
        cashierQueue: true,
        schedule: {
          doctor: true,
        },
      },
    });

    if (!appointment) {
      throw new ResponseError('Appointment not found', StatusCodes.NOT_FOUND);
    }

    if (appointment.appointmentStatus == AppointmentStatus.DONE) {
      throw new ResponseError('Appointment already pay', StatusCodes.NOT_FOUND);
    }

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const finishDate = new Date();

      appointment.appointmentStatus = AppointmentStatus.DONE;
      appointment.finishTime = finishDate;
      appointment.cashierQueue.finishTime = finishDate;
      appointment.consultationFee = appointment.schedule.doctor.consulePrice;

      await queryRunner.manager.save(appointment.cashierQueue);
      await queryRunner.manager.save(appointment);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    return appointment;
  }
}
