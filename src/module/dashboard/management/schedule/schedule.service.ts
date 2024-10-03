import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FixedSchedule,
  ScheduleDayNumber,
} from 'src/database/entities/fixedschedule.entity';
import { Schedule } from 'src/database/entities/schedule.entity';
import { LoggerService } from 'src/module/logger/logger.service';
import {
  QueryFailedError,
  Repository,
  type FindOptionsWhere,
  Between,
  LessThan,
  MoreThan,
  DataSource,
} from 'typeorm';
import type {
  FixedScheduleCreateDTO,
  FixedScheduleUpdateDTO,
} from './model/schedule.dto';
import { ResponseError } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';
import { Doctor } from 'src/database/entities/doctor.entity';
import { Room } from 'src/database/entities/room.entity';
import * as dayjs from 'dayjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { findDateInSameWeek } from 'src/utils/date.utils';
import { Appointment } from 'src/database/entities/appointment.entitity';

@Injectable()
export class ScheduleManagementService {
  constructor(
    private log: LoggerService,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(FixedSchedule)
    private readonly fixedScheduleRepository: Repository<FixedSchedule>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly dataSource: DataSource,
  ) {}

  async getSchedule({
    date,
    startTime,
    endTime,
    doctorId,
    roomId,
    pageSize,
    pageNumber,
    status,
    startDate,
    endDate,
  }: {
    date: string;
    startTime: string;
    endTime: string;
    doctorId: number;
    roomId: number;
    status: string;
    pageSize: number;
    pageNumber: number;
    startDate: string;
    endDate: string;
  }) {
    let where: FindOptionsWhere<Schedule> = {};

    if (startTime && endTime) {
      where = { startTime: Between(startTime, endTime) };
    } else if (startTime) {
      where = { startTime: Between(startTime, '23:59:59') };
    } else if (endTime) {
      where = { startTime: Between('00:00', endTime) };
    }

    if (startDate || endDate) {
      where = {
        ...where,
        date: Between(
          dayjs(startDate, 'YYYY-MM-DD').toDate(),
          dayjs(endDate, 'YYYY-MM-DD').toDate(),
        ),
      };
    } else {
      where = {
        ...where,
        date: dayjs(date, 'YYYY-MM-DD').toDate() || undefined,
      };
    }

    const [data, count] = await this.scheduleRepository.findAndCount({
      select: {
        capacity: true,
        date: true,
        endTime: true,
        id: true,
        startTime: true,
        status: true,
        type: true,
      },
      relations: {
        doctor: {
          specialization: true,
        },
        room: true,
      },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      order: {
        id: 'ASC',
      },
      where: {
        doctor: doctorId ? { id: doctorId } : undefined,
        room: roomId ? { id: roomId } : undefined,
        status: status || undefined,
        ...where,
      },
    });

    return {
      totalRows: count,
      list: data.map((d) => ({
        ...d,
        startTime: d.startTime.substring(0, 5),
        endTime: d.endTime.substring(0, 5),
      })),
    };
  }

  async getFixedSchedule({
    day,
    doctorId,
    pageNumber,
    pageSize,
    roomId,
    startTime,
    endTime,
  }: {
    pageSize: number;
    pageNumber: number;
    doctorId: number;
    roomId: number;
    day: string;
    startTime: string;
    endTime: string;
  }) {
    let where: FindOptionsWhere<FixedSchedule> = {};

    if (startTime && endTime) {
      where = { startTime: Between(startTime, endTime) };
    } else if (startTime) {
      where = { startTime: Between(startTime, '23:59:59') };
    } else if (endTime) {
      where = { startTime: Between('00:00', endTime) };
    }

    const [data, count] = await this.fixedScheduleRepository.findAndCount({
      select: {
        day: true,
        endTime: true,
        id: true,
        startTime: true,
        syncDate: true,
        capacity: true,
      },
      relations: {
        doctor: true,
        room: true,
      },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      order: {
        id: 'ASC',
      },
      where: {
        day: day || undefined,
        doctor: doctorId ? { id: doctorId } : undefined,
        room: roomId ? { id: roomId } : undefined,
        ...where,
      },
    });

    return {
      totalRows: count,
      list: data,
    };
  }

  async generateSchedule(fixedSchedule: FixedSchedule) {
    const schedules: Schedule[] = [];

    const startDate = dayjs().add(1, 'day').startOf('day');

    const endDate = startDate.add(4, 'weeks');

    for (
      let date = startDate;
      date.isBefore(endDate);
      date = date.add(1, 'day')
    ) {
      const dayToday = date.day();

      if (dayToday === ScheduleDayNumber[fixedSchedule.day]) {
        const queryRunner = this.dataSource.createQueryRunner();

        const schedule = this.scheduleRepository.create({
          capacity: fixedSchedule.capacity,
          date: date.toDate(),
          doctor: fixedSchedule.doctor,
          endTime: fixedSchedule.endTime,
          room: fixedSchedule.room,
          startTime: fixedSchedule.startTime,
          status: 'ready',
          fixedSchedule,
          type: 'regular',
        });

        try {
          await queryRunner.connect();

          await queryRunner.startTransaction();

          const savedSchedule = await queryRunner.manager.save(schedule);

          await queryRunner.commitTransaction();

          schedules.push(savedSchedule);
        } catch (e) {
          await queryRunner.rollbackTransaction();
          this.log.error(`duplicate entry ${JSON.stringify(schedule)}`, e);
          if (e instanceof QueryFailedError) {
            if ((e as any).code !== '23505') {
              throw e;
            }
          }
        } finally {
          await queryRunner.release();
        }
      }
    }

    fixedSchedule.syncDate = new Date();

    await this.fixedScheduleRepository.save(fixedSchedule);

    return schedules;
  }

  async createFixedSchedule(body: FixedScheduleCreateDTO) {
    try {
      const doctor = new Doctor();
      doctor.id = body.doctorId;

      const room = new Room();
      room.id = body.roomId;

      const data = this.fixedScheduleRepository.create({
        day: body.day,
        endTime: body.endTime,
        doctor,
        room,
        startTime: body.startTime,
        capacity: body.capacity,
        syncDate: new Date(),
      });

      const result = await this.fixedScheduleRepository.save(data);

      const schedules = await this.generateSchedule(result);

      return { schedules, fixedSchedule: result };
    } catch (e) {
      if (e instanceof QueryFailedError) {
        if ((e as any).code === '23505') {
          throw new ResponseError(
            'Fixed schedule duplicate',
            StatusCodes.CONFLICT,
          );
        }
      }

      throw e;
    }
  }

  async updateFixedSchedule(body: FixedScheduleUpdateDTO) {
    try {
      const fixedSchedule = await this.fixedScheduleRepository.findOne({
        where: { id: body.id },
        relations: {
          doctor: true,
        },
      });

      if (!fixedSchedule) {
        throw new ResponseError(
          'Fixed Schedule not found',
          StatusCodes.BAD_REQUEST,
        );
      }

      const room = new Room();
      room.id = body.roomId;

      fixedSchedule.capacity = body.capacity;
      fixedSchedule.day = body.day;
      fixedSchedule.endTime = body.endTime;
      fixedSchedule.room = room;
      fixedSchedule.startTime = body.startTime;

      // If not override schedule, the schedule that created is not updated and will be sync the next month
      if (!body.isOverrideSchedule) {
        await this.fixedScheduleRepository.save(fixedSchedule);
        return fixedSchedule;
      }

      // Override Schedule -> Create New Schedule -> Create New Appointment from old schedule
      // New Appointment set to new schedule -> update old schedule to cancel and moved to
      //   -> update old appointment since the new appointment for new schedule is created, the old one is cancelled
      fixedSchedule.syncDate = new Date();

      const schedules = await this.scheduleRepository.find({
        where: {
          fixedSchedule: {
            id: fixedSchedule.id,
          },
          date: MoreThan(dayjs().add(1, 'day').toDate()),
          type: 'regular',
        },
        relations: {
          appointments: {
            patient: true,
          },
          fixedSchedule: true,
        },
      });

      const queryRunner = this.dataSource.createQueryRunner();

      try {
        const dayToday = dayjs().startOf('day');

        for (let i = 0; i < schedules.length; i++) {
          const oldSchedule = schedules[i];

          await queryRunner.startTransaction();

          const changedToDate = findDateInSameWeek(
            dayjs(oldSchedule.date),
            fixedSchedule.day,
          );

          if (changedToDate.isBefore(dayToday)) {
            continue;
          }

          const newAppointments = oldSchedule.appointments.map((d) => {
            return this.appointmentRepository.create({ ...d, id: undefined });
          });

          const newAppointmensSaved =
            await queryRunner.manager.save(newAppointments);

          const newSchedule = await queryRunner.manager.save(
            this.scheduleRepository.create({
              capacity: fixedSchedule.capacity,
              appointments: newAppointmensSaved,
              date: changedToDate.toDate(),
              doctor: fixedSchedule.doctor,
              endTime: fixedSchedule.endTime,
              fixedSchedule,
              room: fixedSchedule.room,
              startTime: fixedSchedule.startTime,
              status: 'ready',
              type: 'regular',
            }),
          );

          oldSchedule.movedTo = newSchedule.id;
          oldSchedule.status = 'cancelled';

          const oldAppointments = oldSchedule.appointments.map((d) =>
            this.appointmentRepository.create({
              ...d,
              appointmentStatus: 'cancel',
            }),
          );

          await queryRunner.manager.save(oldAppointments);

          oldSchedule.appointments = oldAppointments;

          await queryRunner.manager.save(oldSchedule);

          await queryRunner.manager.save(fixedSchedule);

          await queryRunner.commitTransaction();
        }
      } catch (e) {
        await queryRunner.rollbackTransaction();

        await queryRunner.release();

        throw e;
      }

      return fixedSchedule;
    } catch (e) {
      if (e instanceof QueryFailedError) {
        if ((e as any).code === '23505') {
          throw new ResponseError(
            'Fixed schedule or room or time duplicate',
            StatusCodes.CONFLICT,
          );
        }
      }

      throw e;
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cronScheduleGenerate() {
    const lastUpdateDaysAgo = dayjs().subtract(3, 'weeks').toDate();

    let newSchedulesCount = 0;

    const fixedSchedules = await this.fixedScheduleRepository.find({
      where: {
        syncDate: LessThan(lastUpdateDaysAgo),
      },
      relations: {
        doctor: true,
        room: true,
      },
    });

    for (let i = 0; i < fixedSchedules.length; i++) {
      newSchedulesCount =
        newSchedulesCount +
        (await this.generateSchedule(fixedSchedules[i])).length;
    }

    this.log.info(
      `${fixedSchedules.length} fixed schedule generated, ${newSchedulesCount} new schedules`,
    );
  }
}
