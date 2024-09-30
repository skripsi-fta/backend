import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Specialization } from 'src/database/entities/specialization.entity';
import { ILike, Repository } from 'typeorm';
import { ResponseError } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';
import type {
  SpecializationPostDTO,
  SpecializationSwitchDTO,
  SpecializationUpdateDTO,
} from './model/specialization.dto';
import { LoggerService } from 'src/module/logger/logger.service';

@Injectable()
export class SpecializationService {
  constructor(
    private log: LoggerService,
    @InjectRepository(Specialization)
    private readonly specializationRepository: Repository<Specialization>,
  ) {}

  async getSpecialization(
    pageSize: number,
    pageNumber: number,
    id: number,
    name: string,
    description: string,
  ) {
    const [data, count] = await this.specializationRepository.findAndCount({
      select: {
        id: true,
        name: true,
        description: true,
        staffs: true,
        isActive: true,
      },
      relations: ['staffs'],
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      order: {
        id: 'ASC',
      },
      where: {
        id: id ? id : undefined,
        name: name ? ILike(`%${name}%`) : undefined,
        description: description ? ILike(`%${description}%`) : undefined,
      },
    });

    return {
      totalRows: count,
      list: data.map((d) => ({
        id: d.id,
        name: d.name,
        description: d.description,
        doctorCount: d.staffs?.length ?? 0,
        isActive: d.isActive,
      })),
    };
  }

  async createSpecialization(body: SpecializationPostDTO) {
    const specializationExist = await this.specializationRepository.findOne({
      where: [{ name: body.name }],
    });

    if (specializationExist) {
      throw new ResponseError(
        'Specialization already exist',
        StatusCodes.BAD_REQUEST,
      );
    }

    const data = this.specializationRepository.create({
      name: body.name,
      description: body.description,
    });

    const result = await this.specializationRepository.save(data);

    return result;
  }

  async switchSpecialization(body: SpecializationSwitchDTO) {
    const specialization = await this.specializationRepository.findOneBy({
      id: body.id,
    });

    if (!specialization) {
      throw new ResponseError(
        'Failed - Specialization not found',
        StatusCodes.NOT_FOUND,
      );
    }

    specialization.isActive = !specialization.isActive;

    const result = await this.specializationRepository.save(specialization);

    return result;
  }

  async updateSpecialization(body: SpecializationUpdateDTO) {
    const specialization = await this.specializationRepository.findOneBy({
      id: body.id,
    });

    specialization.name = body.name;
    specialization.description = body.description;

    const result = await this.specializationRepository.save(specialization);

    return result;
  }
}
