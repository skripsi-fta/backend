import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from 'src/database/entities/appointment.entitity';
import { FixedSchedule } from 'src/database/entities/fixedschedule.entity';
import { Schedule } from 'src/database/entities/schedule.entity';
import { ScheduleTemp } from 'src/database/entities/scheduletemp.entity';
import { LoggerService } from 'src/module/logger/logger.service';
import { Repository, DataSource, QueryFailedError } from 'typeorm';
import type { RequestChangeScheduleDTO } from './model/schedule.dto';
import { ResponseError } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';
import { ScheduleManagementService } from '../../management/schedule/schedule.service';
import { Doctor } from 'src/database/entities/doctor.entity';

@Injectable()
export class ScheduleDoctorService {
  constructor(
    private log: LoggerService,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(FixedSchedule)
    private readonly fixedScheduleRepository: Repository<FixedSchedule>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly dataSource: DataSource,
    @InjectRepository(ScheduleTemp)
    private readonly scheduleTempRepository: Repository<ScheduleTemp>,
    private scheduleManagementService: ScheduleManagementService,
  ) {}

  async requestChangeSchedule(body: RequestChangeScheduleDTO) {
    try {
      const doctor = new Doctor();
      doctor.id = body.doctorId;

      const oldSchedule = new Schedule();
      oldSchedule.id = body.scheduleId;
      oldSchedule.status = 'in review';

      await this.scheduleRepository.save(oldSchedule);

      const scheduleTemp = await this.scheduleTempRepository.save(
        this.scheduleTempRepository.create({
          capacity: body.capacity,
          date: body.date,
          doctor,
          endTime: body.endTime,
          notes: body.notes,
          oldSchedule,
          startTime: body.startTime,
          status: 'waiting',
        }),
      );

      return scheduleTemp;
    } catch (e) {
      if (e instanceof QueryFailedError) {
        if ((e as any).code === '23505') {
          throw new ResponseError(
            'Schedule or room or time duplicate',
            StatusCodes.CONFLICT,
          );
        }
      }

      throw e;
    }
  }
}
