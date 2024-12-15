import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from 'src/database/entities/appointment.entitity';
import { DataSource, Repository } from 'typeorm';
import { DateTime } from 'luxon';
import { LoggerService } from 'src/module/logger/logger.service';

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
      `
          SELECT
              pq.queue_number as "queueNumber",
              p."name" as "patientName",
              a.appointment_status as "status"
          FROM
              appointment a
          JOIN pharmacy_queue pq on a.pharmacy_queue_id = pq.id
          JOIN patient p ON a.patient_id = p.id
          JOIN schedule s ON a.schedule_id = s.id
          WHERE pq."date" = '${dateNow}' AND a.appointment_status IN ('pharmacy queue', 'cashier queue', 'done')
          ORDER BY pq.queue_number ASC
        `,
    )) as Array<{ queueNumber: number; patientName: string; status: string }>;

    let lastQueueNull: {
      queueNumber: number;
      patientName: string;
      status: string;
    } | null = null;

    let queueReturn: {
      queueNumber: number;
      patientName: string;
      status: string;
    } | null = null;

    for (let i = 0; i < data.length; i++) {
      const current = data[i];
      const next = data[i + 1] || null;
      const afterNext = data[i + 2] || null;

      if (current.status === 'pharmacy queue') {
        lastQueueNull = current;
        if (next && next.status !== 'pharmacy queue') {
          if (afterNext && afterNext.status === 'pharmacy queue') {
            queueReturn = afterNext;
          }
          continue;
        }

        return current;
      }
    }

    if (queueReturn) {
      return queueReturn;
    } else if (lastQueueNull) {
      return lastQueueNull;
    } else if (data[data.length - 1]) {
      return data[data.length - 1];
    } else return null;
  }

  async getLiveCashierQueue() {
    const loggerDateFormat = 'yyyy-MM-dd';
    const currDate = DateTime.now();
    const dateNow = currDate.toFormat(loggerDateFormat);

    const data = (await this.dataSource.query(
      `
          SELECT
              cq.queue_number as "queueNumber",
              p."name" as "patientName",
              a.appointment_status as "status"
          FROM
              appointment a
          JOIN cashier_queue cq on a.cashier_queue_id = cq.id
          JOIN patient p ON a.patient_id = p.id
          JOIN schedule s ON a.schedule_id = s.id
          WHERE cq."date" = '${dateNow}' AND a.appointment_status IN ('cashier queue', 'done')
          ORDER BY cq.queue_number ASC
        `,
    )) as Array<{ queueNumber: number; patientName: string; status: string }>;

    let lastQueueNull: {
      queueNumber: number;
      patientName: string;
      status: string;
    } | null = null;

    let queueReturn: {
      queueNumber: number;
      patientName: string;
      status: string;
    } | null = null;

    for (let i = 0; i < data.length; i++) {
      const current = data[i];
      const next = data[i + 1] || null;
      const afterNext = data[i + 2] || null;

      if (current.status === 'cashier queue') {
        lastQueueNull = current;
        if (next && next.status !== 'cashier queue') {
          if (afterNext && afterNext.status === 'cashier queue') {
            queueReturn = afterNext;
          }
          continue;
        }

        return current;
      }
    }

    if (queueReturn) {
      return queueReturn;
    } else if (lastQueueNull) {
      return lastQueueNull;
    } else if (data[data.length - 1]) {
      return data[data.length - 1];
    } else return null;
  }

  async getLiveDoctorQueue() {
    const loggerDateFormat = 'yyyy-MM-dd';
    const currDate = DateTime.now();
    const dateNow = currDate.toFormat(loggerDateFormat);

    const data = await this.dataSource.query(
      `
        WITH earliest_schedules AS (
            SELECT DISTINCT ON (s.room_id) 
                s.room_id, 
                s.id AS schedule_id, 
                s.start_time, 
                s.doctor_id
            FROM schedule s
            WHERE s.status = 'ready' AND s.date = '${dateNow}' 
              AND CURRENT_TIME BETWEEN s.start_time AND s.end_time
            ORDER BY s.room_id, s.start_time ASC
        ),
        appointment_counts AS (
            SELECT
                a.schedule_id,
                COUNT(*) AS appointment_count
            FROM appointment a
            WHERE a.appointment_status NOT IN ('scheduled', 'checkin')
            GROUP BY a.schedule_id
        )
        SELECT 
            s.room_id as "roomId", 
            s.schedule_id as "scheduleId", 
            r.name as "roomName", 
            d.name as "doctorName", 
            s2.name as "poli", 
            dq.queue_number as "queueNumber", 
            a.pharmacy_queue_id as "pharmacyQueueId", 
            ac.appointment_count AS "totalQueue", 
            dq.finish_time as "finishTime", 
            p.name as "patientName"
        FROM earliest_schedules s
        JOIN appointment a ON s.schedule_id = a.schedule_id
        JOIN room r ON r.id = s.room_id
        JOIN doctor d ON d.id = s.doctor_id
        JOIN specialization s2 ON s2.id = d.specialization_id
        JOIN doctor_queue dq ON dq.id = a.doctor_queue_id
        JOIN appointment_counts ac ON ac.schedule_id = s.schedule_id
        JOIN patient p ON a.patient_id = p.id
        WHERE a.appointment_status NOT IN ('scheduled', 'checkin')
        ORDER BY dq.queue_number ASC, s.room_id, s.start_time, a.id
      `,
    );

    const queryData = data.reduce((acc, curr) => {
      if (!acc[curr.roomId]) {
        acc[curr.roomId] = [];
      }
      acc[curr.roomId].push(curr);
      return acc;
    }, {});

    const result = [];

    for (const roomId of Object.keys(queryData)) {
      const appointmentList = queryData[roomId];

      let lastQueueNull: {
        queueNumber: number;
        finishTime: string;
        patientName: string;
      } | null = null;

      let queueReturn: {
        queueNumber: number;
        finishTime: string;
        patientName: string;
      } | null = null;

      for (let i = 0; i < appointmentList.length; i++) {
        const current = appointmentList[i];
        const next = appointmentList[i + 1] || null;
        const afterNext = appointmentList[i + 2] || null;

        if (current.finishTime === null) {
          lastQueueNull = current;
          if (next && next.finishTime !== null) {
            if (afterNext && afterNext.finishTime === null) {
              queueReturn = afterNext;
            }
            continue;
          }

          break;
        }
      }

      if (queueReturn) {
        result.push(queueReturn);
      } else if (lastQueueNull) {
        result.push(lastQueueNull);
      } else if (appointmentList[appointmentList.length - 1]) {
        result.push(appointmentList[appointmentList.length - 1]);
      }
    }

    return result;
  }

  async getGlobalQueue() {
    const loggerDateFormat = 'yyyy-MM-dd';
    const currDate = DateTime.now();
    const dateNow = currDate.toFormat(loggerDateFormat);

    const data = (await this.dataSource.query(
      `
          SELECT
              a.global_queue as "queueNumber",
              a.medical_record_id as "medicalRecordId",
              p."name" as "patientName"
          FROM
              appointment a
          LEFT JOIN schedule s ON s.id = a.schedule_id
          LEFT JOIN patient p ON a.patient_id = p.id
          WHERE s.date = '${dateNow}' AND appointment_status NOT IN ('scheduled', 'cancel')
          ORDER BY a.global_queue ASC
        `,
    )) as Array<{
      queueNumber: number;
      medicalRecordId: number | null;
      patientName: string;
    }>;

    if (data.length === 0) {
      return null;
    }

    let lastQueueNull: {
      queueNumber: number;
      medicalRecordId: number | null;
      patientName: string;
    } | null = null;

    let queueReturn: {
      queueNumber: number;
      medicalRecordId: number | null;
      patientName: string;
    } | null = null;

    for (let i = 0; i < data.length; i++) {
      const current = data[i];
      const next = data[i + 1] || null;
      const afterNext = data[i + 2] || null;

      if (current.medicalRecordId === null) {
        lastQueueNull = current;
        if (next && next.medicalRecordId !== null) {
          if (afterNext && afterNext.medicalRecordId === null) {
            queueReturn = afterNext;
          }
          continue;
        }

        return current;
      }
    }

    if (queueReturn) {
      return queueReturn;
    } else if (lastQueueNull) {
      return lastQueueNull;
    } else if (data[data.length - 1]) {
      return data[data.length - 1];
    } else return null;
  }

  async getDoctorQueue(scheduleId: number) {
    const data = (await this.dataSource.query(
      `
        SELECT
            dq.queue_number as "queueNumber",
            p."name" as "patientName",
            dq.finish_time as "finishTime"
        FROM
            appointment a
        LEFT JOIN doctor_queue dq ON a.doctor_queue_id = dq.id
        LEFT JOIN patient p on a.patient_id = p.id
        WHERE dq.schedule_id = $1
        ORDER BY dq.queue_number ASC
      `,
      [scheduleId],
    )) as Array<{
      queueNumber: number;
      patientName: string;
      finishTime: string;
    }>;

    if (data.length === 0) {
      return null;
    }

    let lastQueueNull: {
      queueNumber: number;
      patientName: string;
    } | null = null;

    let queueReturn: {
      queueNumber: number;
      patientName: string;
    } | null = null;

    console.log(data);

    for (let i = 0; i < data.length; i++) {
      const current = data[i];
      const next = data[i + 1] || null;
      const afterNext = data[i + 2] || null;

      if (current.finishTime === null) {
        lastQueueNull = current;
        if (next && next.finishTime !== null) {
          if (afterNext && afterNext.finishTime === null) {
            queueReturn = afterNext;
          }
          continue;
        }

        return current;
      }
    }

    if (queueReturn) {
      console.log('a', queueReturn);
      return queueReturn;
    } else if (lastQueueNull) {
      console.log('b', lastQueueNull);

      return queueReturn;
    } else if (data[data.length - 1]) {
      console.log('c', data[data.length - 1]);

      return data[data.length - 1];
    } else return null;
  }
}
