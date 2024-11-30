import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Specialization } from 'src/database/entities/specialization.entity';
import { ILike, type Repository } from 'typeorm';

@Injectable()
export class SpecializationService {
  constructor(
    @InjectRepository(Specialization)
    private readonly specializationRepository: Repository<Specialization>,
  ) {}

  async getSpecialization(name: string, pageSize: number, pageNumber: number) {
    const [data, count] = await this.specializationRepository.findAndCount({
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      order: {
        id: 'ASC',
      },
      where: {
        name: name ? ILike(`%${name}%`) : undefined,
      },
    });

    return {
      data,
      currentPage: Number(pageNumber),
      totalPages: Number(Math.ceil((count || 0) / pageSize)),
      totalRows: Number(count || 0),
    };
  }
}
