import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Appointment,
  AppointmentStatus,
} from 'src/database/entities/appointment.entitity';
import { LoggerService } from 'src/module/logger/logger.service';
import { Repository } from 'typeorm';
import { AppointmentPostDTO, AppointmentPutDTO } from './model/appointment.dto';
import { Patient } from 'src/database/entities/patient.entity';
import { StatusCodes } from 'http-status-codes';
import { ResponseError } from 'src/utils/api.utils';
import { Schedule } from 'src/database/entities/schedule.entity';
import { MedicalRecord } from 'src/database/entities/medicalrecord.entity';
import { generateQRCode } from 'src/utils/qrcode.utils';

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

    const appointmentExist = await this.appointmentRepository.findOne({
      where: {
        patient: { id: req.patientId },
        schedule: { id: req.scheduleId },
      },
    });

    // validation to check patient on that schedule already registered
    if (appointmentExist) {
      throw new ResponseError(
        'Patient already registered on this schedule',
        StatusCodes.CONFLICT,
      );
    }

    // capacity check(?)
    if (scheduleExist.capacity <= 0 || scheduleExist.status !== 'ready') {
      throw new ResponseError('Schedule not available', StatusCodes.CONFLICT);
    }

    const bookingCode = this.generateBookingCode();

    const data = {
      bookingCode: bookingCode,
    };

    const bookingQr = await generateQRCode(JSON.stringify(data));

    const appointment = await this.appointmentRepository.create({
      bookingCode: bookingCode,
      bookingQr: bookingQr,
      patient: patientExist,
      schedule: scheduleExist,
    });

    const result = await this.appointmentRepository.save(appointment);
    return {
      data: result,
    };
  }

  async updateAppointment(req: AppointmentPutDTO) {
    const appointment = await this.appointmentRepository.findOne({
      relations: ['patient', 'schedule', 'medicalRecord'],
      where: { id: req.id },
    });

    if (!appointment) {
      throw new ResponseError('Appointment not found', StatusCodes.NOT_FOUND);
    }

    if (appointment.appointmentStatus !== 'scheduled') {
      throw new ResponseError(
        'Appointment cannot be updated',
        StatusCodes.CONFLICT,
      );
    }

    const scheduleExist = await this.scheduleRepository.findOne({
      where: { id: req.scheduleId },
    });

    if (!scheduleExist) {
      throw new ResponseError('Schedule not found', StatusCodes.CONFLICT);
    }

    if (scheduleExist.capacity <= 0 || scheduleExist.status !== 'ready') {
      throw new ResponseError('Schedule not available', StatusCodes.CONFLICT);
    }

    const medicalRecordExist = await this.medicalRepository.findOne({
      relations: {
        patient: true,
      },
      where: { id: req.medicalRecordId },
    });

    if (
      !medicalRecordExist ||
      medicalRecordExist.patient.id !== appointment.patient.id
    ) {
      throw new ResponseError('Medical Record not found', StatusCodes.CONFLICT);
    }

    appointment.schedule = scheduleExist;
    appointment.medicalRecord = medicalRecordExist;

    const result = await this.appointmentRepository.save(appointment);
    return {
      data: result,
    };
  }

  async updateAppointmentStatus(bookingCode: string, status: string) {
    if (!bookingCode) {
      throw new ResponseError(
        'Booking code is required',
        StatusCodes.BAD_REQUEST,
      );
    }

    const appointment = await this.appointmentRepository.findOne({
      where: { bookingCode: bookingCode },
    });

    if (!appointment) {
      throw new ResponseError('Appointment not found', StatusCodes.NOT_FOUND);
    }

    if (appointment.appointmentStatus === status) {
      throw new ResponseError(
        'Appointment already ' + status,
        StatusCodes.CONFLICT,
      );
    }

    if (status === AppointmentStatus.CHECKIN) {
      appointment.isCheckIn = true;
      appointment.checkInTime = new Date();
    }

    if (status === AppointmentStatus.DONE) {
      appointment.finishTime = new Date();
    }

    appointment.appointmentStatus = status;

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
