import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MedicalRecord } from 'src/database/entities/medicalrecord.entity';
import { LoggerService } from 'src/module/logger/logger.service';
import { Repository, DataSource } from 'typeorm';
import {
  MedicalRecordPostDTO,
  MedicalRecordPutDTO,
} from './model/medicalrecord.dto';
import { Patient } from 'src/database/entities/patient.entity';
import { ResponseError } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';
import { Appointment } from 'src/database/entities/appointment.entitity';
import { DoctorQueue } from 'src/database/entities/doctorqueue.entity';

@Injectable()
export class MedicalrecordService {
  constructor(
    private log: LoggerService,
    private readonly dataSource: DataSource,
    @InjectRepository(MedicalRecord)
    private readonly medicalRecordRepository: Repository<MedicalRecord>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(DoctorQueue)
    private readonly doctorQueueRepository: Repository<DoctorQueue>,
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

    const appointmentExist = await this.appointmentRepository.findOne({
      relations: {
        patient: true,
        medicalRecord: true,
        schedule: {
          doctor: true,
        },
      },
      where: [{ id: req.appointmentId }],
    });

    if (!appointmentExist) {
      throw new ResponseError('Appointment not found', StatusCodes.CONFLICT);
    }

    // validation to check patient id on appointment and req are same
    if (appointmentExist.patient.id !== req.patientId) {
      throw new ResponseError(
        'Patient not schedule in this appointment',
        StatusCodes.CONFLICT,
      );
    }

    // validation to check medical record already add to this appointment
    if (appointmentExist.medicalRecord) {
      throw new ResponseError(
        'Medical Record already exist in this appointment',
        StatusCodes.CONFLICT,
      );
    }

    // validation to check appointment is check in
    if (appointmentExist.isCheckIn === false) {
      throw new ResponseError(
        'Appointment is not checked in, please check in first',
        StatusCodes.CONFLICT,
      );
    }

    // validation to check appointment status is check in
    if (appointmentExist.appointmentStatus !== 'checkin') {
      throw new ResponseError(
        'Appointment is not in check in status',
        StatusCodes.CONFLICT,
      );
    }

    const medicalRecord = this.medicalRecordRepository.create({
      ...req,
      patient: patientExist,
    });

    const result = await this.medicalRecordRepository.save(medicalRecord);

    appointmentExist.medicalRecord = result;

    const latestDoctorQueue = (await this.dataSource.query(
      `
        SELECT
            dq.queue_number
        FROM
            appointment a
        JOIN
            doctor_queue dq
        ON
            a.doctor_queue_id = dq.id
        WHERE
            schedule_id = $1
        ORDER BY
            dq.queue_number DESC
        LIMIT 1
      `,
      [appointmentExist.schedule.id],
    )) as Array<{ queue_number: number }>;

    let doctorQueueNumber = 1;

    if (latestDoctorQueue.length === 1) {
      doctorQueueNumber = latestDoctorQueue[0].queue_number + 1;
    }

    const doctorQueue = new DoctorQueue();

    doctorQueue.date = new Date();
    doctorQueue.startTime = new Date();
    doctorQueue.doctor = appointmentExist.schedule.doctor;
    doctorQueue.queueNumber = doctorQueueNumber;

    appointmentExist.doctorQueue = doctorQueue;

    await this.doctorQueueRepository.save(doctorQueue);

    await this.appointmentRepository.save(appointmentExist);

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
