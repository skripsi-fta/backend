import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MedicalRecord } from 'src/database/entities/medicalrecord.entity';
import { LoggerService } from 'src/module/logger/logger.service';
import { Repository } from 'typeorm';
import {
  MedicalRecordPostDTO,
  MedicalRecordPutDTO,
} from './model/medicalrecord.dto';
import { Patient } from 'src/database/entities/patient.entity';
import { ResponseError } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';

@Injectable()
export class MedicalrecordService {
  constructor(
    private log: LoggerService,
    @InjectRepository(MedicalRecord)
    private readonly medicalRecordRepository: Repository<MedicalRecord>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async getMedicalRecord(
    pageSize: number,
    pageNumber: number,
    id: number,
    patientId: number,
  ) {
    const [data, count] = await this.medicalRecordRepository.findAndCount({
      relations: {
        patient: true,
      },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      order: {
        id: 'ASC',
      },
      where: {
        id: id ? id : undefined,
        patient: patientId ? { id: patientId } : undefined,
      },
    });

    return {
      totalRows: count,
      list: data,
    };
  }

  async addMedicalRecord(req: MedicalRecordPostDTO) {
    const patientExist = await this.patientRepository.findOne({
      where: [{ id: req.patientId }],
    });

    if (!patientExist) {
      throw new ResponseError('Patient not found', StatusCodes.CONFLICT);
    }

    const medicalRecord = this.medicalRecordRepository.create({
      ...req,
      patient: patientExist,
    });

    const result = await this.medicalRecordRepository.save(medicalRecord);

    return {
      id: result.id,
      height: result.height,
      weight: result.weight,
      systolic: result.systolic,
      diastolic: result.diastolic,
      temperature: result.temperature,
      illness: result.illness,
      patientId: result.patient.id,
    };
  }

  async updateMedicalRecord(req: MedicalRecordPutDTO) {
    const medicalRecord = await this.medicalRecordRepository.findOneBy({
      id: req.id,
    });

    if (!medicalRecord) {
      throw new ResponseError(
        'Medical Record not found',
        StatusCodes.NOT_FOUND,
      );
    }

    return await this.medicalRecordRepository.update(
      {
        id: req.id,
      },
      {
        height: req.height,
        weight: req.weight,
        systolic: req.systolic,
        diastolic: req.diastolic,
        temperature: req.temperature,
        illness: req.illness,
      },
    );
  }

  async deleteMedicalRecord(id: number) {
    const medicalRecord = await this.medicalRecordRepository.findOneBy({
      id: id,
    });

    if (!medicalRecord) {
      throw new ResponseError(
        'Medical Record not found',
        StatusCodes.NOT_FOUND,
      );
    }

    return await this.medicalRecordRepository.delete({ id });
  }
}
