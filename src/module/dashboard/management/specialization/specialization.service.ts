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
import { StorageService } from 'src/module/storage/storage.service';

@Injectable()
export class SpecializationService {
  constructor(
    private log: LoggerService,
    @InjectRepository(Specialization)
    private readonly specializationRepository: Repository<Specialization>,
    private googleStorage: StorageService,
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

  async createSpecialization(
    body: SpecializationPostDTO,
    image: Express.Multer.File,
  ) {
    let filePath = null;

    const specializationExist = await this.specializationRepository.findOne({
      where: [{ name: body.name }],
    });

    if (specializationExist) {
      throw new ResponseError(
        'Specialization already exist',
        StatusCodes.BAD_REQUEST,
      );
    }

    if (image) {
      filePath = await this.googleStorage.upload(image);
    }

    const data = this.specializationRepository.create({
      name: body.name,
      description: body.description,
      photoPath: filePath,
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

  async updateSpecialization(
    body: SpecializationUpdateDTO,
    image: Express.Multer.File,
  ) {
    let filePath = null;
    const specialization = await this.specializationRepository.findOneBy({
      id: body.id,
    });

    if (!specialization) {
      throw new ResponseError(
        'Failed - Specialization not found',
        StatusCodes.NOT_FOUND,
      );
    }

    if (image) {
      if (
        specialization.photoPath &&
        (await this.googleStorage.get(specialization.photoPath))
      ) {
        await this.googleStorage.delete(specialization.photoPath);
      }
      filePath = await this.googleStorage.upload(image);
    }

    specialization.name = body.name;
    specialization.description = body.description;
    specialization.photoPath = filePath ? filePath : specialization.photoPath;

    const result = await this.specializationRepository.save(specialization);

    return result;
  }
}
