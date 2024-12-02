import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import { StatusCodes } from 'http-status-codes';
import { Doctor } from 'src/database/entities/doctor.entity';
import { ResponseError } from 'src/utils/api.utils';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    private readonly dataSource: DataSource,
  ) {}

  async getDoctor(
    name: string,
    pageSize: number,
    pageNumber: number,
    spesialisasiId: number,
  ) {
    let whereQuery = ' WHERE 1=1 ';

    const whereParams: any[] = [];

    if (name) {
      whereQuery += ` AND WHERE LOWER(d."name") LIKE $${whereParams.length + 1}`;
      whereParams.push(name);
    }

    if (spesialisasiId) {
      whereQuery += ` AND s2.id = $${whereParams.length + 1}`;
      whereParams.push(spesialisasiId);
    }

    const data = await this.dataSource.query(
      `
        WITH doctor_data AS (
            SELECT
                d.id,
                d."name",
                d.profile,
                d.rating,
                d.total_rating as "totalRating",
                d.consule_price as "consulePrice",
                d.photo_path as "photoPath",
                cast(SUM(CASE WHEN a.appointment_status = 'done' THEN 1 ELSE 0 END) as INTEGER) as "totalPasien",
                s2."name" as "namaSpesialisasi"
            FROM
                doctor d
            LEFT JOIN schedule s ON
                s.doctor_id = d.id
            LEFT JOIN appointment a ON
                a.schedule_id = s.id
            LEFT JOIN specialization s2 ON
                d.specialization_id = s2.id
            ${whereQuery}
            GROUP BY
                d.id,
                d."name",
                d.profile,
                d.rating,
                d.total_rating,
                d.consule_price,
                d.photo_path,
                s2."name"
        ),
        total_count AS (
            SELECT COUNT(*) as total
            FROM doctor_data
        )
        SELECT
            doctor_data.*,
            total_count.total
        FROM
            doctor_data, total_count
        ORDER BY doctor_data."rating" DESC, doctor_data."totalPasien" DESC
        LIMIT $${whereParams.length + 1} OFFSET $${whereParams.length + 2}
        `,
      [...whereParams, pageSize, (pageNumber - 1) * pageSize],
    );

    return {
      data: data.map((item) => ({
        ...item,
        total: undefined,
      })),
      currentPage: Number(pageNumber),
      totalPages: Number(Math.ceil((data[0]?.total || 0) / pageSize)),
      totalRows: Number(data[0]?.total || 0),
    };
  }

  async getDoctorDetail(doctorId: number) {
    const data = (await this.dataSource.query(
      `
        SELECT
            d.id,
            d."name",
            d.profile,
            d.rating,
            d.total_rating as "totalRating",
            d.consule_price as "consulePrice",
            d.photo_path as "photoPath",
            CAST(SUM(CASE WHEN a.appointment_status = 'done' THEN 1 ELSE 0 END) as INTEGER) as "totalPasien",
            s2."name" as "namaSpesialisasi"
        FROM
            doctor d
        LEFT JOIN schedule s ON
            s.doctor_id = d.id
        LEFT JOIN appointment a ON
            a.schedule_id = s.id
        LEFT JOIN specialization s2 ON
            d.specialization_id = s2.id
        WHERE d.id = $1
        GROUP BY
            d.id,
            d."name",
            d.profile,
            d.rating,
            d.total_rating,
            d.consule_price,
            d.photo_path,
            s2."name"
      `,
      [doctorId],
    )) as Array<any>;

    if (data.length !== 1) {
      throw new ResponseError('Dokter tidak ditemukan', StatusCodes.NOT_FOUND);
    }

    const doctorData = data[0];

    const scheduleData = (await this.dataSource.query(
      `
        SELECT
            fs.id,
            fs.day,
            fs.start_time as "startTime",
            fs.end_time as "endTime",
            fs.capacity
        FROM
            fixed_schedule fs
        WHERE
            fs.doctor_id = $1
      `,
      [doctorId],
    )) as Array<{
      id: number;
      day: string;
      startTime: string;
      endTime: string;
      capacity: number;
    }>;

    let days: {
      [days: string]: {
        id: number;
        day: string;
        startTime: string;
        endTime: string;
        capacity: number;
      }[];
    } = {
      SENIN: [],
      SELASA: [],
      RABU: [],
      KAMIS: [],
      JUMAT: [],
      SABTU: [],
      MINGGU: [],
    };

    scheduleData.forEach((d) => {
      days = { ...days, [d.day]: [...days[d.day], d] };
    });

    days = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(days).filter(([_, value]) => value.length > 0),
    );

    return {
      doctorData,
      scheduleData: days,
    };
  }

  async getDoctorSchedule(doctorId: number, monthNumber: number) {
    const date = dayjs().month(monthNumber);

    const firstDay = date.startOf('month').format('YYYY-MM-DD');

    const secondDay = date.endOf('month').format('YYYY-MM-DD');

    const data = (await this.dataSource.query(
      `
        SELECT
            s.id,
            TO_CHAR(s.date, 'YYYY-MM-DD') as "date",
            s.capacity,
            TO_CHAR(s.start_time, 'HH24:MI') as "startTime",
            TO_CHAR(s.end_time, 'HH24:MI') as "endTime",
            s."type",
            CAST(COUNT(a.id) as INTEGER) as "totalPasien",
            CASE
                WHEN CAST(COUNT(a.id) AS INTEGER) > (s.capacity * 0.7) THEN 'Hampir Penuh'
                WHEN CAST(COUNT(a.id) as INTEGER) = s.capacity THEN 'Tidak Tersedia'
                ELSE 'Tersedia'
                END AS "status"
        FROM
            schedule s
        LEFT JOIN appointment a ON a.schedule_id = s.id
        WHERE s.doctor_id = $1 AND s.date BETWEEN $2 AND $3 AND s.status = 'ready' AND a.appointment_status != 'cancel'
        GROUP BY s.id
        ORDER BY s.date
        `,
      [doctorId, firstDay, secondDay],
    )) as Array<{
      id: number;
      date: string;
      capacity: number;
      status: string;
      startTime: string;
      endTime: string;
      type: string;
      totalPasien: number;
    }>;

    return data;
  }
}
