import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from 'src/database/entities/doctor.entity';
import { LoggerService } from 'src/module/logger/logger.service';
import { DataSource, type Repository } from 'typeorm';
import type { CurrentAppointmentDTO } from './model/appointment.dto';
import { Staff } from 'src/database/entities/staff.entity';
import { ResponseError } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';
import { Appointment } from 'src/database/entities/appointment.entitity';
import { Schedule } from 'src/database/entities/schedule.entity';
import * as dayjs from 'dayjs';

@Injectable()
export class AppointmentDoctorService {
  constructor(
    private log: LoggerService,
    private readonly dataSource: DataSource,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  async getCurrentAppointment(body: CurrentAppointmentDTO) {
    const doctorId = await this.dataSource.query(
      `
        SELECT doctor_id FROM staff WHERE id = $1
      `,
      [body.user.id],
    );

    if (doctorId.length !== 1) {
      throw new ResponseError(
        'User Logged In is not doctor',
        StatusCodes.BAD_REQUEST,
      );
    }

    if (doctorId[0].doctor_id === null) {
      throw new ResponseError(
        'User Logged In is not doctor',
        StatusCodes.BAD_REQUEST,
      );
    }

    const schedule = await this.scheduleRepository.find({
      where: {
        date: new Date(),
      },
    });

    if (schedule.length === 0) {
      return null;
    }

    const now = dayjs();

    const { schedule: closestSchedule } = schedule.reduce(
      (closest, schedule) => {
        const scheduleTime = dayjs(`${schedule.date} ${schedule.startTime}`);
        const diff = Math.abs(now.diff(scheduleTime));

        if (!closest || diff < closest.diff) {
          return { schedule, diff };
        }

        return closest;
      },
      null as { schedule: Schedule; diff: number } | null,
    );

    console.log(closestSchedule);

    return closestSchedule;
  }
}
