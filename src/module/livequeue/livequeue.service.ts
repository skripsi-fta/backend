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

  async getLiveDoctorQueue() {
    const loggerDateFormat = 'yyyy-MM-dd';
    const currDate = DateTime.now();
    const dateNow = currDate.toFormat(loggerDateFormat);

    const data = await this.dataSource.query(
      `with rankedRoom as (
            with countRoom as (
                select s2."name" as poli, d."name" as doctorName, r.id as roomId, r."name" as roomName, dq.queue_number as queueNumber, COUNT(*) OVER(PARTITION BY r.id ) AS totalCount, a.appointment_status as status
                FROM room r 
                join schedule s on r.id = s.room_id 
                join appointment a on a.schedule_id = s.id
                join doctor d on s.doctor_id = d.id 
                join specialization s2 on s2.id = d.specialization_id 
                join doctor_queue dq on a.doctor_queue_id = dq.id 
                where s.date = '${dateNow}' and CURRENT_TIME between s.start_time and s.end_time 
                order by dq.queue_number 
            )
            select poli, doctorName, roomId, roomName, queueNumber, totalCount, ROW_NUMBER() OVER (PARTITION BY roomId ORDER BY queueNumber ASC) AS rank
            from countRoom
            where status = 'doctor queue'
        )
        select poli , doctorName, roomId, roomName, queueNumber, totalCount as totalQueue
        from rankedRoom
        where rank = 1
        order by roomId`,
    );

    return data.map((item) => ({
      poli: item.poli,
      doctorName: item.doctorname,
      roomName: item.roomname,
      queueNumber: item.queuenumber.toString(),
      totalQueue: item.totalqueue,
    }));
  }
}
