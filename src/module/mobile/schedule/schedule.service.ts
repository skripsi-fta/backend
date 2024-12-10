import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Schedule } from 'src/database/entities/schedule.entity';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    private readonly dataSource: DataSource,
  ) {}

  async getSchedule(
    startDate: string,
    endDate: string,
    pageSize: number,
    pageNumber: number,
  ) {
    let whereQuery = ' WHERE 1=1 ';

    const whereParams: any[] = [];

    if (endDate) {
      whereQuery += ` AND s.date BETWEEN $${whereParams.length + 1} AND $${whereParams.length + 2}`;
      whereParams.push(startDate, endDate);
    } else {
      whereQuery +=
        ' AND (s.date >= NOW() OR (s.date = CURRENT_DATE AND s.end_time >= NOW()::time))';
    }

    const data = await this.dataSource.query(
      `
        WITH schedule_data AS (
            SELECT
                s.id,
                TO_CHAR(s.date, 'YYYY-MM-DD') as "date",
                s.capacity,
                s.status,
                TO_CHAR(s.start_time, 'HH24:MI') as "startTime",
                TO_CHAR(s.end_time, 'HH24:MI') as "endTime",
                s."type",
                CAST(COUNT(a.id) as INTEGER) as "totalPasien",
                d.id as "doctorId",
                d."name" as "doctorName",
                d.rating as "rating",
                d.total_rating as "totalRating",
                d.consule_price as "consulePrice",
                d.photo_path as "photoPathDoctor",
                s2."name" as "spesialisasiName"
            FROM
                schedule s
            LEFT JOIN appointment a ON a.schedule_id = s.id
            LEFT JOIN doctor d ON d.id = s.doctor_id
            LEFT JOIN specialization s2 ON s2.id = d.specialization_id
            ${whereQuery}
            GROUP BY s.id, d.id, s2."name"
            HAVING COUNT(a.id) < s.capacity
            ORDER BY s.date ASC, s.start_time ASC
        ),
        total_count AS (
            SELECT COUNT(*) as total
            from schedule_data
        )
        SELECT
            schedule_data.*,
            total_count.total
        FROM
            schedule_data, total_count
        ORDER BY schedule_data.date ASC
        LIMIT $${whereParams.length + 1} OFFSET $${whereParams.length + 2}
      `,
      [
        ...whereParams,
        Number(pageSize),
        (Number(pageNumber) - 1) * Number(pageSize),
      ],
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
}
