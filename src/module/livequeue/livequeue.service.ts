import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from 'src/database/entities/appointment.entitity';
import { DataSource, Repository } from 'typeorm';
import { DateTime } from 'luxon';

@Injectable()
export class LivequeueService {
  constructor(
    private log: LoggerService,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    private readonly dataSource: DataSource,
  ) {}

  async getLivePharmacyQueue() {
    const loggerDateFormat = 'yyyy-MM-dd';
    const currDate = DateTime.now();
    const dateNow = currDate.toFormat(loggerDateFormat);

    const data = (await this.dataSource.query(
      `select pq.queue_number as "queueNumber", p."name" as "patientName"
          from appointment a 
          join pharmacy_queue pq on a.pharmacy_queue_id = pq.id 
          join patient p on a.patient_id = p.id 
          join schedule s on a.schedule_id = s.id 
          where a.appointment_status = 'pharmacy queue' and s."date" = '${dateNow}'
          order by pq.queue_number limit 1`,
    )) as Array<unknown>;

    if (data.length === 0) {
      return null;
    }

    return data[0];
  }

  async getLiveCashierQueue() {
    const loggerDateFormat = 'yyyy-MM-dd';
    const currDate = DateTime.now();
    const dateNow = currDate.toFormat(loggerDateFormat);

    const data = (await this.dataSource.query(
      `select cq.queue_number as "queueNumber", p."name" as "patientName"
        from appointment a 
        join cashier_queue cq on a.cashier_queue_id = cq.id 
        join patient p on a.patient_id = p.id 
        join schedule s on a.schedule_id = s.id 
        where a.appointment_status = 'cashier queue' and s."date" = '${dateNow}'
        order by cq.queue_number limit 1`,
    )) as Array<unknown>;

    if (data.length === 0) {
      return null;
    }

    return data[0];
  }
}
