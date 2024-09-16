import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Staff } from 'src/database/entities/staff.entity';
import { Like, Repository } from 'typeorm';
import { StaffPostDTO, StaffPutDTO } from './model/staff.dto';
import { ResponseError } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';
import { Doctor } from 'src/database/entities/doctor.entity';

@Injectable()
export class StaffService {
  constructor(
    private log: LoggerService,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  async getStaff(
    pageSize: number,
    pageNumber: number,
    id: number,
    role: string,
    name: string,
    email: string,
  ) {
    const [data, count] = await this.staffRepository.findAndCount({
      select: ['id', 'username', 'name', 'email', 'role', 'doctor'],
      relations: ['doctor'],
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      order: {
        id: 'ASC',
      },
      where: {
        id: id ? id : undefined,
        name: name ? Like(`%${name}%`) : undefined,
        email: email ? Like(`%${email}%`) : undefined,
        role: role ? role.toUpperCase() : undefined,
      },
    });

    return {
      totalRows: count,
      list: data.map((user) => ({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        doctor: user?.doctor || undefined,
      })),
    };
  }

  async addStaff(data: StaffPostDTO) {
    const userExist = await this.staffRepository.findOne({
      where: [{ username: data.username }, { email: data.email }],
    });

    if (userExist) {
      throw new ResponseError(
        'Username or email already exist',
        StatusCodes.CONFLICT,
      );
    }

    if (data.role === 'DOCTOR') {
      if (!data.doctorId) {
        throw new ResponseError(
          'Doctor ID is required for DOCTOR role',
          StatusCodes.BAD_REQUEST,
        );
      }

      const doctor = await this.doctorRepository.findOneBy({
        id: parseInt(data.doctorId),
      });

      if (!doctor) {
        throw new ResponseError('Doctor not found', StatusCodes.NOT_FOUND);
      }

      return await this.staffRepository.insert({
        ...data,
        doctor,
      });
    }
    return await this.staffRepository.insert(data);
  }

  async updateStaff(data: StaffPutDTO) {
    const staff = await this.staffRepository.findOneBy({ id: data.id });

    if (!staff) {
      throw new ResponseError('Staff not found', StatusCodes.NOT_FOUND);
    }

    if (data.role === 'DOCTOR') {
      if (!data.doctorId) {
        throw new ResponseError(
          'Doctor ID is required for DOCTOR role',
          StatusCodes.BAD_REQUEST,
        );
      }

      const doctor = await this.doctorRepository.findOneBy({
        id: parseInt(data.doctorId),
      });

      if (!doctor) {
        throw new ResponseError('Doctor not found', StatusCodes.NOT_FOUND);
      }

      return await this.staffRepository.update(
        { id: data.id },
        {
          username: data.username,
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
          doctor,
        },
      );
    }

    return await this.staffRepository.update(
      { id: data.id },
      {
        username: data.username,
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      },
    );
  }

  async deleteStaff(id: number) {
    const staff = await this.staffRepository.findOneBy({ id });

    if (!staff) {
      throw new ResponseError('Staff not found', StatusCodes.NOT_FOUND);
    }

    return await this.staffRepository.delete({ id });
  }
}
