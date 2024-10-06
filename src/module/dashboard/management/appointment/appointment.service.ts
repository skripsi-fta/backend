import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from 'src/database/entities/appointment.entitity';
import { LoggerService } from 'src/module/logger/logger.service';
import { Repository } from 'typeorm';
import { AppointmentPostDTO } from './model/appointment.dto';
import { Patient } from 'src/database/entities/patient.entity';
import { StatusCodes } from 'http-status-codes';
import { ResponseError } from 'src/utils/api.utils';
import { Schedule } from 'src/database/entities/schedule.entity';
import { MedicalRecord } from 'src/database/entities/medicalrecord.entity';

@Injectable()
export class AppointmentService {
  constructor(
    private log: LoggerService,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(MedicalRecord)
    private readonly medicalRepository: Repository<MedicalRecord>,
  ) {}

  async getAppointment(
    pageSize: number,
    pageNumber: number,
    id: number,
    bookingCode: string,
    appointmentStatus: string,
  ) {
    const [data, count] = await this.appointmentRepository.findAndCount({
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      order: {
        id: 'ASC',
      },
      where: {
        id: id ? id : undefined,
        bookingCode: bookingCode ? bookingCode : undefined,
        appointmentStatus: appointmentStatus ? appointmentStatus : undefined,
      },
    });

    return {
      totalRows: count,
      list: data,
    };
  }

  async addAppointment(req: AppointmentPostDTO) {
    this.log.info('req: ' + JSON.stringify(req));
    const patientExist = await this.patientRepository.findOne({
      where: [{ id: req.patientId }],
    });

    if (!patientExist) {
      throw new ResponseError('Patient not found', StatusCodes.CONFLICT);
    }

    const scheduleExist = await this.scheduleRepository.findOne({
      where: { id: req.scheduleId },
    });

    if (!scheduleExist) {
      throw new ResponseError('Schedule not found', StatusCodes.CONFLICT);
    }

    // cek capacity dari schedule (?)
    if (scheduleExist.capacity <= 0 || scheduleExist.status !== 'ready') {
      throw new ResponseError('Schedule not available', StatusCodes.CONFLICT);
    }

    const medicalRecordExist = await this.medicalRepository.findOne({
      relations: {
        patient: true,
      },
      where: { id: req.medicalRecordId },
    });

    this.log.info('medicalRecordExist: ' + JSON.stringify(medicalRecordExist));

    if (
      !medicalRecordExist ||
      medicalRecordExist.patient.id !== req.patientId
    ) {
      throw new ResponseError('Medical Record not found', StatusCodes.CONFLICT);
    }

    // generate booking code
    const bookingCode = this.generateBookingCode();
    // generate booking qr
    // booking code, scheduledate, scheduletime, patientid, appointmentid
    const bookingQr = '123456';

    const appointment = this.appointmentRepository.create({
      bookingCode: bookingCode,
      bookingQr: bookingQr,
      patient: patientExist,
      schedule: scheduleExist,
      medicalRecord: medicalRecordExist,
    });

    const result = await this.appointmentRepository.save(appointment);
    return {
      data: result,
    };
  }

  generateBookingCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    const getRandomChar = (str: string) =>
      str.charAt(Math.floor(Math.random() * str.length));

    const bookingCode =
      Array.from({ length: 3 }, () => getRandomChar(chars)).join('') +
      Array.from({ length: 2 }, () => getRandomChar(digits)).join('');

    return bookingCode;
  }
}
