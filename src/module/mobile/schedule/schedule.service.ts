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
      whereQuery += ` AND s.date BETWEEN $${whereParams.length + 1} and $${whereParams.length + 2}`;
      whereParams.push(startDate, endDate);
    } else {
      whereQuery += ` AND s.date >= $${whereParams.length + 1}`;
      whereParams.push(startDate);
    }

    const data = await this.dataSource.query(
      `
        WITH schedule_data AS (
            SELECT
                s.id,
                s.date,
                s.capacity,
                s.status,
                s.start_time as "startTime",
                s.end_time as "endTime",
                s."type",
                CAST(COUNT(a.id) as INTEGER) as "totalPasien",
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
            ORDER BY s.id
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
