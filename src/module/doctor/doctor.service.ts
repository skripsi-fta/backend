import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Doctor } from 'src/database/entities/doctor.entity';
import { DoctorPostDTO, DoctorPutDTO } from './model/doctor.dto';
import { ResponseError } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';
import { Specialization } from 'src/database/entities/specialization.entity';

@Injectable()
export class DoctorService {
  constructor(
    private log: LoggerService,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Specialization)
    private readonly specializationRepository: Repository<Specialization>,
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
      })),
    };
  }

  async addDoctor(data: DoctorPostDTO) {
    const specialization = await this.specializationRepository.findOne({
      where: { id: data.specializationId },
    });

    if (!specialization) {
      throw new ResponseError('Specialization not found', StatusCodes.CONFLICT);
    }

    const doctor = this.doctorRepository.create({
      name: data.name,
      profile: data.profile,
      consulePrice: data.consulePrice,
      specialization,
    });

    const result = await this.doctorRepository.save(doctor);

    return {
      id: result.id,
      name: result.name,
      profile: result.profile,
      consulePrice: result.consulePrice,
    };
  }

  async updateDoctor(req: DoctorPutDTO) {
    const specialization = await this.specializationRepository.findOne({
      where: { id: req.specializationId },
    });

    if (!specialization) {
      throw new ResponseError('Specialization not found', StatusCodes.CONFLICT);
    }

    const doctor = await this.doctorRepository.findOneBy({ id: req.id });

    if (!doctor) {
      throw new ResponseError('Doctor not found', StatusCodes.NOT_FOUND);
    }

    doctor.name = req.name;
    doctor.profile = req.profile;
    doctor.consulePrice = req.consulePrice;
    doctor.specialization = specialization;

    const result = await this.doctorRepository.save(doctor);

    return {
      id: result.id,
      name: result.name,
      profile: result.profile,
      consulePrice: result.consulePrice,
    };
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
