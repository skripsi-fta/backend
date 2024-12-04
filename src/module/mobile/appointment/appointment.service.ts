import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from 'src/database/entities/appointment.entitity';
import { DataSource, Repository } from 'typeorm';
import { UserDTO } from '../auth/model/auth.dto';
import { CreateAppointmentDTO } from './model/appointment.dto';
import { Patient } from 'src/database/entities/patient.entity';
import { Auth } from 'src/database/entities/auth.entitity';
import { ResponseError } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';
import { Schedule } from 'src/database/entities/schedule.entity';
import { generateQRCode } from 'src/utils/qrcode.utils';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    private readonly dataSource: DataSource,
  ) {}

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

  async createAppointment(user: UserDTO, body: CreateAppointmentDTO) {
    const userPatientData = await this.authRepository.findOne({
      where: {
        id: user.id,
      },
      relations: {
        patient: true,
      },
    });

    if (!userPatientData.patient) {
      throw new ResponseError(
        'Data pasien tidak ditemukan',
        StatusCodes.NOT_FOUND,
      );
    }

    const scheduleExist = await this.scheduleRepository.findOne({
      where: { id: body.scheduleId },
    });

    if (!scheduleExist) {
      throw new ResponseError('Jadwal tidak ditemukan', StatusCodes.CONFLICT);
    }

    if (scheduleExist.status !== 'ready') {
      throw new ResponseError('Jadwal tidak tersedia', StatusCodes.CONFLICT);
    }

    const countAppointmentBySchedule = await this.appointmentRepository.count({
      where: { schedule: { id: body.scheduleId } },
    });

    if (countAppointmentBySchedule >= scheduleExist.capacity) {
      throw new ResponseError('Kuota jadwal sudah penuh', StatusCodes.CONFLICT);
    }

    const appointmentExist = await this.appointmentRepository.findOne({
      where: {
        patient: { id: userPatientData.patient.id },
        schedule: { id: body.scheduleId },
      },
    });

    if (appointmentExist) {
      throw new ResponseError(
        'Anda sudah terdaftar di jadwal ini',
        StatusCodes.CONFLICT,
      );
    }

    const bookingCode = this.generateBookingCode();

    const data = {
      bookingCode: bookingCode,
    };

    const bookingQr = await generateQRCode(JSON.stringify(data));

    const appointment = this.appointmentRepository.create({
      bookingCode: bookingCode,
      bookingQr: bookingQr,
      patient: userPatientData.patient,
      schedule: scheduleExist,
    });

    const result = await this.appointmentRepository.save(appointment);

    return result;
  }
}
