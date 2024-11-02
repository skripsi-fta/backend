import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Appointment,
  AppointmentStatus,
} from 'src/database/entities/appointment.entitity';
import { LoggerService } from 'src/module/logger/logger.service';
import { Between, Repository, type FindOptionsWhere } from 'typeorm';
import { AppointmentPostDTO, AppointmentPutDTO } from './model/appointment.dto';
import { Patient } from 'src/database/entities/patient.entity';
import { StatusCodes } from 'http-status-codes';
import { ResponseError } from 'src/utils/api.utils';
import { Schedule } from 'src/database/entities/schedule.entity';
import { MedicalRecord } from 'src/database/entities/medicalrecord.entity';
import { generateQRCode } from 'src/utils/qrcode.utils';
import * as dayjs from 'dayjs';

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
    startDate: string,
    endDate: string,
    startTime: string,
    endTime: string,
  ) {
    let whereSchedule: FindOptionsWhere<Schedule> = {};

    if (startTime && endTime) {
      whereSchedule = { startTime: Between(startTime, endTime) };
    } else if (startTime) {
      whereSchedule = { startTime: Between(startTime, '23:59:59') };
    } else if (endTime) {
      whereSchedule = { startTime: Between('00:00', endTime) };
    }

    if (startDate || endDate) {
      whereSchedule = {
        ...whereSchedule,
        date: Between(
          dayjs(startDate, 'YYYY-MM-DD').toDate(),
          dayjs(endDate, 'YYYY-MM-DD').toDate(),
        ),
      };
    }

    const [data, count] = await this.appointmentRepository.findAndCount({
      select: [
        'id',
        'bookingCode',
        'bookingQr',
        'appointmentStatus',
        'medicalRecord',
        'isCheckIn',
      ],
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      order: {
        schedule: {
          date: 'ASC',
        },
      },
      relations: {
        patient: true,
        schedule: {
          doctor: true,
          room: true,
        },
        medicalRecord: true,
      },
      where: {
        id: id ? id : undefined,
        bookingCode: bookingCode ? bookingCode : undefined,
        appointmentStatus: appointmentStatus ? appointmentStatus : undefined,
        schedule: whereSchedule,
      },
    });

    const result = data.map((appointment) => ({
      id: appointment.id,
      bookingCode: appointment.bookingCode,
      bookingQr: appointment.bookingQr,
      patientId: appointment.patient.id,
      patientName: appointment.patient.name,
      appointmentStatus: appointment.appointmentStatus,
      doctorName: appointment.schedule.doctor.name,
      roomName: appointment.schedule.room.name,
      medicalRecord: appointment.medicalRecord
        ? {
            id: appointment.medicalRecord.id,
            height: appointment.medicalRecord.height,
            weight: appointment.medicalRecord.weight,
            systolic: appointment.medicalRecord.systolic,
            diastolic: appointment.medicalRecord.diastolic,
            temperature: appointment.medicalRecord.temperature,
            illness: appointment.medicalRecord.illness,
            diagnosisDoctor: appointment.medicalRecord.diagnosisDoctor,
            prescription: appointment.medicalRecord.prescription,
            notes: appointment.medicalRecord.notes,
          }
        : null,
      checkInStatus: appointment.isCheckIn,
      scheduleId: appointment.schedule.id,
      scheduleDate: appointment.schedule.date,
      startTime: appointment.schedule.startTime.substring(0, 5),
      endTime: appointment.schedule.endTime.substring(0, 5),
      date: `${appointment.schedule.date} ${appointment.schedule.startTime.substring(0, 5)} - ${appointment.schedule.endTime.substring(0, 5)}`,
    }));

    return {
      totalRows: count,
      list: result,
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

    if (scheduleExist.status !== 'ready') {
      throw new ResponseError('Schedule not available', StatusCodes.CONFLICT);
    }

    const countAppointmentBySchedule = await this.appointmentRepository.count({
      where: { schedule: { id: req.scheduleId } },
    });

    // check schedule capcity
    if (countAppointmentBySchedule >= scheduleExist.capacity) {
      throw new ResponseError('Schedule already full', StatusCodes.CONFLICT);
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

    if (scheduleExist.status !== 'ready') {
      throw new ResponseError('Schedule not available', StatusCodes.CONFLICT);
    }

    const countAppointmentBySchedule = await this.appointmentRepository.count({
      where: { schedule: { id: req.scheduleId } },
    });

    // check schedule capcity
    if (countAppointmentBySchedule >= scheduleExist.capacity) {
      throw new ResponseError('Schedule already full', StatusCodes.CONFLICT);
    }

    appointment.schedule = scheduleExist;

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
      relations: {
        schedule: true,
      },
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
      const today = new Date().setHours(0, 0, 0, 0);
      const appointmentDate = new Date(appointment.schedule.date).setHours(
        0,
        0,
        0,
        0,
      );
      if (appointmentDate !== today) {
        throw new ResponseError(
          'Appointment is not today',
          StatusCodes.CONFLICT,
        );
      }

      appointment.isCheckIn = true;
      appointment.checkInTime = new Date();

      const latestGlobalQueue = await this.appointmentRepository.findOne({
        select: ['id', 'globalQueue'],
        order: {
          globalQueue: 'DESC',
        },
        where: {
          schedule: {
            id: appointment.schedule.id,
          },
          appointmentStatus: AppointmentStatus.CHECKIN,
        },
      });

      appointment.globalQueue = latestGlobalQueue
        ? latestGlobalQueue.globalQueue + 1
        : 1;

      this.log.info('update Queue' + appointment.globalQueue);
    }

    if (status === AppointmentStatus.DONE) {
      appointment.finishTime = new Date();
    }

    appointment.appointmentStatus = status;

    const result = await this.appointmentRepository.save(appointment);

    return result;
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
