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

  async getRecommendation(total: number) {
    const data = await this.dataSource.query(
      `
        SELECT
            d.id,
            d."name",
            d.profile,
            d.rating,
            d.total_rating as "totalRating",
            d.consule_price as "consulePrice",
            d.photo_path as "photoPath",
            CAST(COUNT(s.id) as INTEGER) as "totalPasien",
            s2."name" as "namaSpesialisasi"
        FROM
            doctor d
        LEFT JOIN schedule s ON
            s.doctor_id = d.id
        LEFT JOIN appointment a ON
            a.schedule_id = s.id
        LEFT JOIN specialization s2 ON
            d.specialization_id = s2.id
        GROUP BY
            d.id,
            d."name",
            d.profile,
            d.rating,
            d.total_rating,
            d.consule_price,
            d.photo_path,
            s2."name"
        ORDER BY d.rating DESC, "totalPasien" DESC
        LIMIT $1
        `,
      [total],
    );

    return data;
  }
}
