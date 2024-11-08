import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import {
  Appointment,
  AppointmentStatus,
} from 'src/database/entities/appointment.entitity';
import { CashierQueue } from 'src/database/entities/cashierqueue.entity';
import { LoggerService } from 'src/module/logger/logger.service';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class CashierService {
  constructor(
    private log: LoggerService,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(CashierQueue)
    private readonly cashierQueueRepository: Repository<CashierQueue>,
  ) {}

  async getCashierQueue(pageSize: number, pageNumber: number) {
    this.log.info('Get Cashier Queue: ' + new Date());
    const [data, count] = await this.appointmentRepository.findAndCount({
      relations: {
        cashierQueue: true,
        patient: true,
      },
      where: {
        appointmentStatus: AppointmentStatus.CASHIERQUEUE,
        cashierQueue: {
          date: dayjs(dayjs().format('YYYY-MM-DD'), 'YYYY-MM-DD').toDate(),
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

    const result = data.map((item) => ({
      id: item.id,
    }));

    return {
      totalRows: count,
      list: result,
    };
  }
}
