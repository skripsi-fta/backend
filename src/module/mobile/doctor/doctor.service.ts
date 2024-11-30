import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from 'src/database/entities/doctor.entity';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    private readonly dataSource: DataSource,
  ) {}

  async getDoctor(name: string, pageSize: number, pageNumber: number) {
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
                CAST(COUNT(DISTINCT s.id) as INTEGER) as "totalPasien",
                s2."name" as "namaSpesialisasi"
            FROM
                doctor d
            LEFT JOIN schedule s ON
                s.doctor_id = d.id
            LEFT JOIN specialization s2 ON
                d.specialization_id = s2.id
            ${name ? `WHERE LOWER(d."name") LIKE $1` : ''}
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
        LIMIT $${name ? 2 : 1} OFFSET $${name ? 3 : 2}
        `,
      name
        ? [`%${name.toLowerCase()}%`, pageSize, (pageNumber - 1) * pageSize]
        : [pageSize, (pageNumber - 1) * pageSize],
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
