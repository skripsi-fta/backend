import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from 'src/database/entities/patient.entity';
import { ILike, Repository } from 'typeorm';
import { PatientPostDTO, PatientPutDTO } from './model/patient.dto';
import { ResponseError } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';

@Injectable()
export class PatientService {
  constructor(
    private log: LoggerService,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async getPatient(
    pageSize: number,
    pageNumber: number,
    id: number,
    name: string,
    gender: string,
    idType: string,
    idNumber: string,
  ) {
    const [data, count] = await this.patientRepository.findAndCount({
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      order: {
        id: 'ASC',
      },
      where: {
        id: id ? id : undefined,
        name: name ? ILike(`%${name}%`) : undefined,
        gender: gender || undefined,
        idType: idType || undefined,
        idNumber: idNumber ? ILike(`${idNumber}%`) : undefined,
      },
    });

    return {
      totalRows: count,
      list: data.map((patient) => ({
        id: patient.id,
        name: patient.name,
        address: patient.address,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        idType: patient.idType,
        idNumber: patient.idNumber,
      })),
    };
  }

  async addPatient(req: PatientPostDTO) {
    const patientExist = await this.patientRepository.findOne({
      where: [{ idNumber: req.idNumber }],
    });

    if (patientExist) {
      throw new ResponseError(
        'Patient already registred',
        StatusCodes.CONFLICT,
      );
    }

    const newPatient = this.patientRepository.create({
      ...req,
    });

    const result = await this.patientRepository.save(newPatient);

    return {
      id: result.id,
      name: result.name,
      address: result.address,
      dateOfBirth: result.dateOfBirth,
      gender: result.gender,
      idType: result.idType,
      idNumber: result.idNumber,
      idPhoto: result.idPhoto,
    };
  }

  async updatePatient(req: PatientPutDTO) {
    const patientExist = await this.patientRepository.findOneBy({
      id: req.id,
    });

    if (!patientExist) {
      throw new ResponseError(
        'Failed - Patient not found',
        StatusCodes.NOT_FOUND,
      );
    }

    patientExist.name = req.name;
    patientExist.address = req.address;
    patientExist.dateOfBirth = new Date(req.dateOfBirth);
    patientExist.gender = req.gender;
    patientExist.idType = req.idType;
    patientExist.idNumber = req.idNumber;

    // TODO: enable if upload completed
    // patientExist.idPhoto = req.idPhoto;

    const result = await this.patientRepository.save(patientExist);

    return {
      id: result.id,
      name: result.name,
      address: result.address,
      dateOfBirth: result.dateOfBirth,
      gender: result.gender,
      idType: result.idType,
      idNumber: result.idNumber,
      idPhoto: result.idPhoto,
    };
  }

  async deletePatient(id: number) {
    const patientExist = await this.patientRepository.findOneBy({
      id: id,
    });

    if (!patientExist) {
      throw new ResponseError(
        'Failed - Patient not found',
        StatusCodes.NOT_FOUND,
      );
    }

    return await this.patientRepository.delete({ id });
  }
}
