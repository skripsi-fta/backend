import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Specialization } from 'src/database/entities/specialization.entity';
import type { Repository } from 'typeorm';

@Injectable()
export class SpecializationService {
  constructor(
    @InjectRepository(Specialization)
    private readonly specializationRepository: Repository<Specialization>,
  ) {}

  async getRecommendation(total: number) {
    const specialization = await this.specializationRepository.find({
      where: { isActive: true },
      take: total,
    });

    return specialization;
  }
}
