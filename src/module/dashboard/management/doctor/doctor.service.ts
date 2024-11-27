import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Doctor } from 'src/database/entities/doctor.entity';
import { DoctorPostDTO, DoctorPutDTO } from './model/doctor.dto';
import { ResponseError } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';
import { Specialization } from 'src/database/entities/specialization.entity';
import { LoggerService } from 'src/module/logger/logger.service';
import { StorageService } from 'src/module/storage/storage.service';

@Injectable()
export class DoctorService {
  constructor(
    private log: LoggerService,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Specialization)
    private readonly specializationRepository: Repository<Specialization>,
    private googleStorage: StorageService,
  ) {}

  async getDoctor(
    id: number,
    name: string,
    rating: boolean,
    totalRating: boolean,
    consulePrice: boolean,
    pageSize: number,
    pageNumber: number,
  ) {
    const order: any = {
      ...(rating && { rating: 'ASC' }),
      ...(totalRating && { totalRating: 'ASC' }),
      ...(consulePrice && { consulePrice: 'ASC' }),
      id: 'ASC',
    };

    const [data, count] = await this.doctorRepository.findAndCount({
      select: {
        id: true,
        name: true,
        profile: true,
        consulePrice: true,
        rating: true,
        totalRating: true,
        photoPath: true,
        specialization: { name: true, description: true, id: true },
      },
      relations: ['specialization'],
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      order,
      where: {
        id: id ? id : undefined,
        name: name ? ILike(`%${name}%`) : undefined,
      },
    });

    return {
      totalRows: count,
      list: data.map((doctor) => ({
        id: doctor.id,
        name: doctor.name,
        profile: doctor.profile,
        consulePrice: doctor.consulePrice,
        totalRating: doctor.totalRating,
        rating: doctor.rating,
        specializationName: doctor.specialization?.name,
        specializationDescription: doctor.specialization?.description,
        specializationId: doctor.specialization?.id,
        photoPath: doctor.photoPath,
      })),
    };
  }

  async addDoctor(data: DoctorPostDTO, image: Express.Multer.File) {
    let filePath = null;

    const specialization = await this.specializationRepository.findOne({
      where: { id: data.specializationId },
    });

    if (!specialization) {
      throw new ResponseError('Specialization not found', StatusCodes.CONFLICT);
    }

    if (image) {
      filePath = await this.googleStorage.upload(image);
    }

    const doctor = this.doctorRepository.create({
      name: data.name,
      profile: data.profile,
      consulePrice: data.consulePrice,
      specialization,
      photoPath: filePath,
    });

    const result = await this.doctorRepository.save(doctor);

    return {
      id: result.id,
      name: result.name,
      profile: result.profile,
      consulePrice: result.consulePrice,
    };
  }

  async updateDoctor(req: DoctorPutDTO, image: Express.Multer.File) {
    try {
      let filePath = null;
      const doctor = await this.doctorRepository.findOneBy({ id: req.id });

      if (!doctor) {
        throw new ResponseError('Doctor not found', StatusCodes.NOT_FOUND);
      }

      let specialization = null;
      if (req.specializationId) {
        specialization = await this.specializationRepository.findOne({
          where: { id: req.specializationId },
        });

        if (!specialization) {
          throw new ResponseError(
            'Specialization not found',
            StatusCodes.CONFLICT,
          );
        }
      }

      if (image) {
        if (
          doctor.photoPath &&
          (await this.googleStorage.get(doctor.photoPath))
        ) {
          await this.googleStorage.delete(doctor.photoPath);
        }
        filePath = await this.googleStorage.upload(image);
      }

      doctor.name = req.name;
      doctor.profile = req.profile;
      doctor.consulePrice = req.consulePrice;
      doctor.specialization = specialization
        ? specialization
        : doctor.specialization;
      doctor.photoPath = filePath ? filePath : doctor.photoPath;

      const result = await this.doctorRepository.save(doctor);

      return {
        id: result.id,
        name: result.name,
        profile: result.profile,
        consulePrice: result.consulePrice,
      };
    } catch (error) {
      throw new ResponseError(
        'Failed - Update Doctor',
        StatusCodes.BAD_REQUEST,
      );
    }
  }

  async deleteDoctor(id: number) {
    const doctor = await this.doctorRepository.findOneBy({ id });

    if (!doctor) {
      throw new ResponseError(
        'Failed - Doctor not found',
        StatusCodes.NOT_FOUND,
      );
    }

    return await this.doctorRepository.delete({ id });
  }
}
