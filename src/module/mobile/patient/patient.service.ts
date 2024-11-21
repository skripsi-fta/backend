import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from 'src/database/entities/patient.entity';
import { LoggerService } from 'src/module/logger/logger.service';
import { Repository } from 'typeorm';
import type { CheckPatientDTO, LinkPatientDTO } from './model/patient.dto';
import { ResponseError } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';
import type { UserDTO } from '../auth/model/auth.dto';
import { Auth } from 'src/database/entities/auth.entitity';

@Injectable()
export class PatientService {
  constructor(
    private log: LoggerService,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
  ) {}

  async checkPatient(body: CheckPatientDTO) {
    const patientExist = await this.patientRepository.findOne({
      where: [{ idNumber: body.idNumber, idType: body.idType }],
    });

    if (!patientExist) {
      throw new ResponseError('Patient not found', StatusCodes.NOT_FOUND);
    }

    return patientExist;
  }

  async linkPatient(body: LinkPatientDTO, user: UserDTO) {
    const patientExist = await this.patientRepository.findOne({
      where: [{ idNumber: body.idNumber, idType: body.idType }],
    });

    if (!patientExist) {
      throw new ResponseError('Patient not found', StatusCodes.NOT_FOUND);
    }

    const userQuery = await this.authRepository.findOne({
      where: {
        id: user.id,
      },
    });

    userQuery.patient = patientExist;

    await this.authRepository.save(userQuery);

    return userQuery;
  }
}
