import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as dayjs from 'dayjs';

@Injectable()
export class ReportManagementService {
  constructor(private readonly dataSource: DataSource) {}

  async getPharmacyReport({
    endDate,
    startDate,
    type,
    month,
    year,
  }: {
    startDate: string;
    endDate: string;
    type: string;
    year: string;
    month: string;
  }) {
    if (type === 'weekly') {
      endDate = dayjs(startDate, 'YYYY-MM-DD')
        .add(7, 'day')
        .format('YYYY-MM-DD');
    } else if (type === 'monthly') {
      startDate = `${year}-${month}-01`;
      endDate = dayjs(startDate, 'YYYY-MM-DD')
        .add(1, 'months')
        .format('YYYY-MM-DD');
    } else if (type === 'yearly') {
      startDate = `${year}-01-01`;
      endDate = dayjs(startDate, 'YYYY-MM-DD')
        .add(1, 'years')
        .format('YYYY-MM-DD');
    }

    const data = (await this.dataSource.query(
      `
        SELECT
            TO_CHAR(JUSTIFY_INTERVAL(pq.finish_time - pq.start_time), 'HH24:MI:SS') AS "waitTime",
            CAST(EXTRACT(EPOCH FROM (pq.finish_time - pq.start_time)) AS INT) AS "totalSecond",
            CAST(ROUND(EXTRACT(EPOCH FROM (pq.finish_time - pq.start_time)) / 60.0) AS INT) AS "totalMinute"
        FROM
            pharmacy_queue pq
        JOIN appointment a ON a.pharmacy_queue_id = pq.id
        JOIN schedule s ON a.schedule_id = s.id
        WHERE s."date" BETWEEN '${startDate}' AND '${endDate}' AND a.appointment_status = 'done'
        ORDER BY "totalMinute" ASC
        `,
    )) as {
      startTime: string;
      finishTime: string;
      waitTime: string;
      totalSecond: number;
      totalMinute: number;
    }[];

    const summaryData = await this.dataSource.query(
      `
          SELECT
              TO_CHAR(JUSTIFY_INTERVAL(AVG(pq.finish_time - pq.start_time)), 'HH24:MI:SS') AS "avgWaitTime",
              CAST(AVG(CAST(EXTRACT(EPOCH FROM (pq.finish_time - pq.start_time)) AS INT)) AS INT) AS "avgTotalSecond",
              CAST(AVG(CAST(ROUND(EXTRACT(EPOCH FROM (pq.finish_time - pq.start_time)) / 60.0) AS INT)) AS INT) AS "avgTotalMinute",
              TO_CHAR(JUSTIFY_INTERVAL(MAX(pq.finish_time - pq.start_time)), 'HH24:MI:SS') AS "maxWaitTime",
              MAX(CAST(EXTRACT(EPOCH FROM (pq.finish_time - pq.start_time)) AS INT)) AS "maxTotalSecond",
              MAX(CAST(ROUND(EXTRACT(EPOCH FROM (pq.finish_time - pq.start_time)) / 60.0) AS INT)) AS "maxTotalMinute",
              TO_CHAR(JUSTIFY_INTERVAL(MIN(pq.finish_time - pq.start_time)), 'HH24:MI:SS') AS "minWaitTime",
              MIN(CAST(EXTRACT(EPOCH FROM (pq.finish_time - pq.start_time)) AS INT)) AS "minTotalSecond",
              MIN(CAST(ROUND(EXTRACT(EPOCH FROM (pq.finish_time - pq.start_time)) / 60.0) AS INT)) AS "minTotalMinute"
          FROM
              pharmacy_queue pq
          JOIN appointment a ON a.pharmacy_queue_id = pq.id
          JOIN schedule s ON a.schedule_id = s.id
          WHERE s."date" BETWEEN '${startDate}' AND '${endDate}' AND a.appointment_status = 'done'
          `,
    );

    let dataBarUnprocessed: { [key: string]: number } = {};

    let belowAverage = 0;

    let aboveAverage = 0;

    data.forEach((d) => {
      if (dataBarUnprocessed[d.totalMinute]) {
        dataBarUnprocessed = {
          ...dataBarUnprocessed,
          [d.totalMinute]: dataBarUnprocessed[d.totalMinute] + 1,
        };
      } else {
        dataBarUnprocessed = { ...dataBarUnprocessed, [d.totalMinute]: 1 };
      }

      if (summaryData[0].avgTotalMinute > d.totalMinute) {
        aboveAverage = aboveAverage + 1;
      } else {
        belowAverage = belowAverage + 1;
      }
    });

    const dataBarProcessed = [];

    Object.keys(dataBarUnprocessed).map((d) => {
      dataBarProcessed.push({ minute: d, count: dataBarUnprocessed[d] });
    });

    return {
      summaryData: dataBarProcessed.length === 0 ? null : summaryData[0],
      belowAverage,
      aboveAverage,
      dataBar: dataBarProcessed,
    };
  }

  async getPharmacyReportList({
    endDate,
    startDate,
    type,
    month,
    year,
    pageNumber,
    pageSize,
  }: {
    startDate: string;
    endDate: string;
    type: string;
    year: string;
    month: string;
    pageSize: number;
    pageNumber: number;
  }) {
    if (type === 'weekly') {
      endDate = dayjs(startDate, 'YYYY-MM-DD')
        .add(7, 'day')
        .format('YYYY-MM-DD');
    } else if (type === 'monthly') {
      startDate = `${year}-${month}-01`;
      endDate = dayjs(startDate, 'YYYY-MM-DD')
        .add(1, 'months')
        .format('YYYY-MM-DD');
    } else if (type === 'yearly') {
      startDate = `${year}-01-01`;
      endDate = dayjs(startDate, 'YYYY-MM-DD')
        .add(1, 'years')
        .format('YYYY-MM-DD');
    }

    const data = await this.dataSource.query(
      `
        WITH pharmacy_data AS (
            SELECT
                a.id as "appointmentId",
                s."date" AS "date",
            	p.id_number AS "patientId",
                d."name" AS "doctorName",
                s2."name" AS "specializationName",
                r."name" AS "roomName",
                TO_CHAR(s.start_time, 'HH24:MI') || ' - ' || TO_CHAR(s.end_time, 'HH24:MI') AS "scheduleTime",
                pq.start_time AS "startTime",
                pq.finish_time AS "endTime"
            FROM
                pharmacy_queue pq
            JOIN appointment a ON a.pharmacy_queue_id = pq.id
            JOIN patient p ON a.patient_id = p.id
            JOIN schedule s ON a.schedule_id = s.id
            JOIN doctor d ON s.doctor_id = d.id
            JOIN specialization s2 ON s2.id = d.specialization_id
            JOIN room r ON r.id = s.room_id
            WHERE s."date" BETWEEN '${startDate}' AND '${endDate}' AND a.appointment_status = 'done'
            ORDER BY pq.id
        ),
        total_count AS (
            SELECT COUNT(*) as total from pharmacy_data
        )
        SELECT
            pharmacy_data.*,
            total_count.total
        FROM pharmacy_data, total_count
        LIMIT ${pageSize} OFFSET ${pageNumber}
      `,
    );

    return {
      data: data.map((item) => ({
        ...item,
        total: undefined,
      })),
      currentPage: Number(pageNumber),
      totalPages: Number(Math.ceil((data[0]?.total || 0) / pageSize)),
      totalRows: Number(data[0]?.total || 0),
      pageNumber: Number(pageNumber),
      pageSize: Number(pageSize),
    };
  }

  async getCashierReport({
    endDate,
    startDate,
    type,
    month,
    year,
  }: {
    startDate: string;
    endDate: string;
    type: string;
    year: string;
    month: string;
  }) {
    if (type === 'weekly') {
      endDate = dayjs(startDate, 'YYYY-MM-DD')
        .add(7, 'day')
        .format('YYYY-MM-DD');
    } else if (type === 'monthly') {
      startDate = `${year}-${month}-01`;
      endDate = dayjs(startDate, 'YYYY-MM-DD')
        .add(1, 'months')
        .format('YYYY-MM-DD');
    } else if (type === 'yearly') {
      startDate = `${year}-01-01`;
      endDate = dayjs(startDate, 'YYYY-MM-DD')
        .add(1, 'years')
        .format('YYYY-MM-DD');
    }

    const data = (await this.dataSource.query(
      `
          SELECT
              TO_CHAR(JUSTIFY_INTERVAL(cq.finish_time - cq.start_time), 'HH24:MI:SS') AS "waitTime",
              CAST(EXTRACT(EPOCH FROM (cq.finish_time - cq.start_time)) AS INT) AS "totalSecond",
              CAST(ROUND(EXTRACT(EPOCH FROM (cq.finish_time - cq.start_time)) / 60.0) AS INT) AS "totalMinute"
          FROM
              cashier_queue cq
          JOIN appointment a ON a.cashier_queue_id = cq.id
          JOIN schedule s ON a.schedule_id = s.id
          WHERE s."date" BETWEEN '${startDate}' AND '${endDate}' AND a.appointment_status = 'done'
          ORDER BY "totalMinute" ASC
          `,
    )) as {
      startTime: string;
      finishTime: string;
      waitTime: string;
      totalSecond: number;
      totalMinute: number;
    }[];

    const summaryData = await this.dataSource.query(
      `
            SELECT
                TO_CHAR(JUSTIFY_INTERVAL(AVG(cq.finish_time - cq.start_time)), 'HH24:MI:SS') AS "avgWaitTime",
                CAST(AVG(CAST(EXTRACT(EPOCH FROM (cq.finish_time - cq.start_time)) AS INT)) AS INT) AS "avgTotalSecond",
                CAST(AVG(CAST(ROUND(EXTRACT(EPOCH FROM (cq.finish_time - cq.start_time)) / 60.0) AS INT)) AS INT) AS "avgTotalMinute",
                TO_CHAR(JUSTIFY_INTERVAL(MAX(cq.finish_time - cq.start_time)), 'HH24:MI:SS') AS "maxWaitTime",
                MAX(CAST(EXTRACT(EPOCH FROM (cq.finish_time - cq.start_time)) AS INT)) AS "maxTotalSecond",
                MAX(CAST(ROUND(EXTRACT(EPOCH FROM (cq.finish_time - cq.start_time)) / 60.0) AS INT)) AS "maxTotalMinute",
                TO_CHAR(JUSTIFY_INTERVAL(MIN(cq.finish_time - cq.start_time)), 'HH24:MI:SS') AS "minWaitTime",
                MIN(CAST(EXTRACT(EPOCH FROM (cq.finish_time - cq.start_time)) AS INT)) AS "minTotalSecond",
                MIN(CAST(ROUND(EXTRACT(EPOCH FROM (cq.finish_time - cq.start_time)) / 60.0) AS INT)) AS "minTotalMinute"
            FROM
                cashier_queue cq
            JOIN appointment a ON a.cashier_queue_id = cq.id
            JOIN schedule s ON a.schedule_id = s.id
            WHERE s."date" BETWEEN '${startDate}' AND '${endDate}' AND a.appointment_status = 'done'
            `,
    );

    let dataBarUnprocessed: { [key: string]: number } = {};

    let belowAverage = 0;

    let aboveAverage = 0;

    data.forEach((d) => {
      if (dataBarUnprocessed[d.totalMinute]) {
        dataBarUnprocessed = {
          ...dataBarUnprocessed,
          [d.totalMinute]: dataBarUnprocessed[d.totalMinute] + 1,
        };
      } else {
        dataBarUnprocessed = { ...dataBarUnprocessed, [d.totalMinute]: 1 };
      }

      if (summaryData[0].avgTotalMinute > d.totalMinute) {
        aboveAverage = aboveAverage + 1;
      } else {
        belowAverage = belowAverage + 1;
      }
    });

    const dataBarProcessed = [];

    Object.keys(dataBarUnprocessed).map((d) => {
      dataBarProcessed.push({ minute: d, count: dataBarUnprocessed[d] });
    });

    return {
      summaryData: dataBarProcessed.length === 0 ? null : summaryData[0],
      belowAverage,
      aboveAverage,
      dataBar: dataBarProcessed,
    };
  }

  async getCashierReportList({
    endDate,
    startDate,
    type,
    month,
    year,
    pageNumber,
    pageSize,
  }: {
    startDate: string;
    endDate: string;
    type: string;
    year: string;
    month: string;
    pageSize: number;
    pageNumber: number;
  }) {
    if (type === 'weekly') {
      endDate = dayjs(startDate, 'YYYY-MM-DD')
        .add(7, 'day')
        .format('YYYY-MM-DD');
    } else if (type === 'monthly') {
      startDate = `${year}-${month}-01`;
      endDate = dayjs(startDate, 'YYYY-MM-DD')
        .add(1, 'months')
        .format('YYYY-MM-DD');
    } else if (type === 'yearly') {
      startDate = `${year}-01-01`;
      endDate = dayjs(startDate, 'YYYY-MM-DD')
        .add(1, 'years')
        .format('YYYY-MM-DD');
    }

    const data = await this.dataSource.query(
      `
        WITH cashier_data AS (
            SELECT
                a.id as "appointmentId",
                s."date" AS "date",
            	p.id_number AS "patientId",
                d."name" AS "doctorName",
                s2."name" AS "specializationName",
                r."name" AS "roomName",
                TO_CHAR(s.start_time, 'HH24:MI') || ' - ' || TO_CHAR(s.end_time, 'HH24:MI') AS "scheduleTime",
                cq.start_time AS "startTime",
                cq.finish_time AS "endTime"
            FROM
                cashier_queue cq
            JOIN appointment a ON a.cashier_queue_id = cq.id
            JOIN patient p ON a.patient_id = p.id
            JOIN schedule s ON a.schedule_id = s.id
            JOIN doctor d ON s.doctor_id = d.id
            JOIN specialization s2 ON s2.id = d.specialization_id
            JOIN room r ON r.id = s.room_id
            WHERE s."date" BETWEEN '${startDate}' AND '${endDate}' AND a.appointment_status = 'done'
            ORDER BY cq.id
        ),
        total_count AS (
            SELECT COUNT(*) as total from cashier_data
        )
        SELECT
            cashier_data.*,
            total_count.total
        FROM cashier_data, total_count
        LIMIT ${pageSize} OFFSET ${pageNumber}
      `,
    );

    return {
      data: data.map((item) => ({
        ...item,
        total: undefined,
        date: dayjs(item.date).format('DD/MM/YYYY'),
      })),
      currentPage: Number(pageNumber),
      totalPages: Number(Math.ceil((data[0]?.total || 0) / pageSize)),
      totalRows: Number(data[0]?.total || 0),
      pageNumber: Number(pageNumber),
      pageSize: Number(pageSize),
    };
  }

  async getDoctorReport({
    endDate,
    startDate,
    type,
    month,
    year,
  }: {
    startDate: string;
    endDate: string;
    type: string;
    year: string;
    month: string;
  }) {
    if (type === 'weekly') {
      endDate = dayjs(startDate, 'YYYY-MM-DD')
        .add(7, 'day')
        .format('YYYY-MM-DD');
    } else if (type === 'monthly') {
      startDate = `${year}-${month}-01`;
      endDate = dayjs(startDate, 'YYYY-MM-DD')
        .add(1, 'months')
        .format('YYYY-MM-DD');
    } else if (type === 'yearly') {
      startDate = `${year}-01-01`;
      endDate = dayjs(startDate, 'YYYY-MM-DD')
        .add(1, 'years')
        .format('YYYY-MM-DD');
    }

    const data = (await this.dataSource.query(
      `
        SELECT
            TO_CHAR(JUSTIFY_INTERVAL(dq.finish_time - dq.start_time), 'HH24:MI:SS') AS "waitTime",
            CAST(EXTRACT(EPOCH FROM (dq.finish_time - dq.start_time)) AS INT) AS "totalSecond",
            CAST(ROUND(EXTRACT(EPOCH FROM (dq.finish_time - dq.start_time)) / 60.0) AS INT) AS "totalMinute"
        FROM
            doctor_queue dq
        JOIN appointment a ON a.doctor_queue_id = dq.id
        JOIN schedule s ON a.schedule_id = s.id
        WHERE s."date" BETWEEN '${startDate}' AND '${endDate}' AND a.appointment_status = 'done'
        ORDER BY "totalMinute" ASC
        `,
    )) as {
      startTime: string;
      finishTime: string;
      waitTime: string;
      totalSecond: number;
      totalMinute: number;
    }[];

    const summaryData = await this.dataSource.query(
      `
        WITH summary_data AS (
            SELECT
                TO_CHAR(JUSTIFY_INTERVAL(AVG(dq.finish_time - dq.start_time)), 'HH24:MI:SS') AS "avgWaitTime",
                CAST(AVG(CAST(EXTRACT(EPOCH FROM (dq.finish_time - dq.start_time)) AS INT)) AS INT) AS "avgTotalSecond",
                CAST(AVG(CAST(ROUND(EXTRACT(EPOCH FROM (dq.finish_time - dq.start_time)) / 60.0) AS INT)) AS INT) AS "avgTotalMinute",
                TO_CHAR(JUSTIFY_INTERVAL(MAX(dq.finish_time - dq.start_time)), 'HH24:MI:SS') AS "maxWaitTime",
                MAX(CAST(EXTRACT(EPOCH FROM (dq.finish_time - dq.start_time)) AS INT)) AS "maxTotalSecond",
                MAX(CAST(ROUND(EXTRACT(EPOCH FROM (dq.finish_time - dq.start_time)) / 60.0) AS INT)) AS "maxTotalMinute",
                TO_CHAR(JUSTIFY_INTERVAL(MIN(dq.finish_time - dq.start_time)), 'HH24:MI:SS') AS "minWaitTime",
                MIN(CAST(EXTRACT(EPOCH FROM (dq.finish_time - dq.start_time)) AS INT)) AS "minTotalSecond",
                MIN(CAST(ROUND(EXTRACT(EPOCH FROM (dq.finish_time - dq.start_time)) / 60.0) AS INT)) AS "minTotalMinute"
            FROM
                doctor_queue dq
            JOIN appointment a ON a.doctor_queue_id = dq.id
            JOIN schedule s ON a.schedule_id = s.id
            WHERE s."date" BETWEEN '${startDate}' AND '${endDate}' AND a.appointment_status = 'done'
        ),
        total_doctor AS (
            SELECT COUNT(*) as "totalDoctor" FROM doctor
        ),
        total_specialization AS (
            SELECT COUNT(*) as "totalSpecialization" FROM specialization
        ),
        total_appointment AS (
            SELECT COUNT(*) as "totalAppointment" FROM appointment WHERE appointment_status = 'done'
        )
        SELECT
            summary_data.*,
            total_doctor.*,
            total_specialization.*,
            total_appointment.*
        FROM summary_data, total_doctor, total_specialization, total_appointment
        `,
    );

    let dataBarUnprocessed: { [key: string]: number } = {};

    let belowAverage = 0;

    let aboveAverage = 0;

    data.forEach((d) => {
      if (dataBarUnprocessed[d.totalMinute]) {
        dataBarUnprocessed = {
          ...dataBarUnprocessed,
          [d.totalMinute]: dataBarUnprocessed[d.totalMinute] + 1,
        };
      } else {
        dataBarUnprocessed = { ...dataBarUnprocessed, [d.totalMinute]: 1 };
      }

      if (summaryData[0].avgTotalMinute > d.totalMinute) {
        aboveAverage = aboveAverage + 1;
      } else {
        belowAverage = belowAverage + 1;
      }
    });

    const dataBarProcessed = [];

    Object.keys(dataBarUnprocessed).map((d) => {
      dataBarProcessed.push({ minute: d, count: dataBarUnprocessed[d] });
    });

    const doctorData = await this.dataSource.query(
      `
        select
            COUNT(*) as "totalPasien",
            d."name"
        from appointment a join schedule s on s.id = a.schedule_id join doctor d on d.id = s.doctor_id
        WHERE s."date" BETWEEN '${startDate}' AND '${endDate}' AND a.appointment_status = 'done'
        group by d."name"
      `,
    );

    const specializationData = await this.dataSource.query(
      `
        select
            COUNT(*) as "totalPasien",
            s2."name"
        from appointment a join schedule s on s.id = a.schedule_id join doctor d on d.id = s.doctor_id join specialization s2 on s2.id = d.specialization_id
        WHERE s."date" BETWEEN '${startDate}' AND '${endDate}' AND a.appointment_status = 'done'
        group by s2."name"
        `,
    );

    return {
      summaryData: dataBarProcessed.length === 0 ? null : summaryData[0],
      belowAverage,
      aboveAverage,
      dataBar: dataBarProcessed,
      doctorData,
      specializationData,
    };
  }

  async getDoctorReportList({
    endDate,
    startDate,
    type,
    month,
    year,
    pageNumber,
    pageSize,
  }: {
    startDate: string;
    endDate: string;
    type: string;
    year: string;
    month: string;
    pageSize: number;
    pageNumber: number;
  }) {
    if (type === 'weekly') {
      endDate = dayjs(startDate, 'YYYY-MM-DD')
        .add(7, 'day')
        .format('YYYY-MM-DD');
    } else if (type === 'monthly') {
      startDate = `${year}-${month}-01`;
      endDate = dayjs(startDate, 'YYYY-MM-DD')
        .add(1, 'months')
        .format('YYYY-MM-DD');
    } else if (type === 'yearly') {
      startDate = `${year}-01-01`;
      endDate = dayjs(startDate, 'YYYY-MM-DD')
        .add(1, 'years')
        .format('YYYY-MM-DD');
    }

    const data = await this.dataSource.query(
      `
          WITH doctor_data AS (
              SELECT
                  a.id as "appointmentId",
                  s."date" AS "date",
                  p.id_number AS "patientId",
                  d."name" AS "doctorName",
                  s2."name" AS "specializationName",
                  r."name" AS "roomName",
                  TO_CHAR(s.start_time, 'HH24:MI') || ' - ' || TO_CHAR(s.end_time, 'HH24:MI') AS "scheduleTime",
                  dq.start_time AS "startTime",
                  dq.finish_time AS "endTime"
              FROM
                  doctor_queue dq
              JOIN appointment a ON a.doctor_queue_id = dq.id
              JOIN patient p ON a.patient_id = p.id
              JOIN schedule s ON a.schedule_id = s.id
              JOIN doctor d ON s.doctor_id = d.id
              JOIN specialization s2 ON s2.id = d.specialization_id
              JOIN room r ON r.id = s.room_id
              WHERE s."date" BETWEEN '${startDate}' AND '${endDate}' AND a.appointment_status = 'done'
              ORDER BY dq.id
          ),
          total_count AS (
              SELECT COUNT(*) as total from doctor_data
          )
          SELECT
              doctor_data.*,
              total_count.total
          FROM doctor_data, total_count
          LIMIT ${pageSize} OFFSET ${pageNumber}
        `,
    );

    return {
      data: data.map((item) => ({
        ...item,
        total: undefined,
        date: dayjs(item.date).format('DD/MM/YYYY'),
      })),
      currentPage: Number(pageNumber),
      totalPages: Number(Math.ceil((data[0]?.total || 0) / pageSize)),
      totalRows: Number(data[0]?.total || 0),
      pageNumber: Number(pageNumber),
      pageSize: Number(pageSize),
    };
  }
}
