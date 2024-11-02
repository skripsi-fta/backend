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
  FixedScheduleDeleteDTO,
  FixedScheduleUpdateDTO,
  ScheduleApprovalDTO,
  ScheduleChangeDTO,
  ScheduleCreateDTO,
} from './model/schedule.dto';
import { ResponseError } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';
import { Doctor } from 'src/database/entities/doctor.entity';
import { Room } from 'src/database/entities/room.entity';
import * as dayjs from 'dayjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { findDateInSameWeek } from 'src/utils/date.utils';
import { Appointment } from 'src/database/entities/appointment.entitity';
import { ScheduleTemp } from 'src/database/entities/scheduletemp.entity';

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
    @InjectRepository(ScheduleTemp)
    private readonly scheduleTempRepository: Repository<ScheduleTemp>,
  ) {}

  async checkScheduleOverlap(
    date: Date,
    startTime: string,
    endTime: string,
    roomId: number,
  ): Promise<boolean> {
    const conflictingSchedule = await this.scheduleRepository.findOne({
      where: {
        date,
        room: { id: roomId },
        startTime: LessThan(endTime),
        endTime: MoreThan(startTime),
        status: 'ready',
      },
    });

    return !!conflictingSchedule;
  }

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
        date: 'ASC',
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
      list: data.map((d) => {
        const startDate = dayjs(`${d.date} ${d.startTime}`);

        const endDate = dayjs(`${d.date} ${d.endTime}`);

        const dateNow = dayjs();

        let status = d.status;

        if (d.status === 'ready') {
          if (dateNow.isBefore(endDate) && dateNow.isAfter(startDate)) {
            status = 'berjalan';
          }
          if (dateNow.isAfter(endDate)) {
            status = 'completed';
          }
        }

        return {
          ...d,
          startTime: d.startTime.substring(0, 5),
          endTime: d.endTime.substring(0, 5),
          status,
        };
      }),
    };
  }

  async getScheduleById(id: number) {
    const data = await this.scheduleRepository.findOne({
      where: {
        id,
      },
      relations: {
        doctor: {
          specialization: true,
        },
        room: true,
        appointments: {
          patient: true,
        },
        movedTo: true,
      },
    });

    let proposedSchedule = null;

    if (data.status !== 'ready') {
      let where: FindOptionsWhere<ScheduleTemp> = {};

      if (data.status === 'changed' && data.movedTo) {
        proposedSchedule = await this.scheduleRepository.findOne({
          where: {
            id: data.movedTo.id,
          },
          relations: {
            doctor: {
              specialization: true,
            },
            room: true,
            appointments: {
              patient: true,
            },
          },
        });
      } else {
        where = {
          ...where,
          oldSchedule: {
            id,
          },
          status: data.status === 'in review' ? 'waiting' : undefined,
        };

        proposedSchedule = await this.scheduleTempRepository.findOne({
          where,
          relations: {
            oldSchedule: {
              doctor: {
                specialization: true,
              },
              room: true,
              appointments: {
                patient: true,
              },
            },
          },
          order: {
            id: 'DESC',
          },
        });
      }
    }

    const startDate = dayjs(`${data.date} ${data.startTime}`);

    const endDate = dayjs(`${data.date} ${data.endTime}`);

    const dateNow = dayjs();

    let status = data.status;

    if (data.status === 'ready') {
      if (dateNow.isBefore(endDate) && dateNow.isAfter(startDate)) {
        status = 'berjalan';
      }
      if (dateNow.isAfter(endDate)) {
        status = 'completed';
      }
    }

    return {
      schedule: { ...data, status },
      proposedSchedule: proposedSchedule || null,
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

    const skippedSchedule: string[] = [];

    for (
      let date = startDate;
      date.isBefore(endDate);
      date = date.add(1, 'day')
    ) {
      const dayToday = date.day();

      if (dayToday === ScheduleDayNumber[fixedSchedule.day]) {
        const queryRunner = this.dataSource.createQueryRunner();

        const isScheduleOverlap = await this.checkScheduleOverlap(
          date.toDate(),
          fixedSchedule.startTime,
          fixedSchedule.endTime,
          fixedSchedule.room.id,
        );

        if (isScheduleOverlap) {
          skippedSchedule.push(
            `${date.format('DD-MM-YYYY')} ${fixedSchedule.startTime.substring(0, 5)} - ${fixedSchedule.endTime.substring(0, 5)}`,
          );
          continue;
        }

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

    return { schedules, skippedSchedule };
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

      return {
        schedules: schedules.schedules,
        fixedSchedule: result,
        skippedSchedule: schedules.skippedSchedule,
      };
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
        return { fixedSchedule };
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
        order: {
          appointments: {
            id: 'ASC',
          },
        },
      });

      const queryRunner = this.dataSource.createQueryRunner();

      const skippedSchedule: string[] = [];

      const changedSchedule: string[] = [];

      try {
        const dayToday = dayjs().startOf('day');

        for (let i = 0; i < schedules.length; i++) {
          const oldSchedule = schedules[i];

          const changedToDate = findDateInSameWeek(
            dayjs(oldSchedule.date),
            fixedSchedule.day,
          );

          const isScheduleOverlap = await this.checkScheduleOverlap(
            changedToDate.toDate(),
            fixedSchedule.startTime,
            fixedSchedule.endTime,
            fixedSchedule.room.id,
          );

          if (isScheduleOverlap) {
            skippedSchedule.push(
              `${changedToDate.format('DD-MM-YYYY')} ${fixedSchedule.startTime.substring(0, 5)} - ${fixedSchedule.endTime.substring(0, 5)}`,
            );

            continue;
          }

          changedSchedule.push(
            `${dayjs(oldSchedule.date).format('DD-MM-YYYY')} -> ${changedToDate.format('DD-MM-YYYY')} ${fixedSchedule.startTime.substring(0, 5)} - ${fixedSchedule.endTime.substring(0, 5)}`,
          );

          await queryRunner.startTransaction();

          if (changedToDate.isBefore(dayToday)) {
            continue;
          }

          const capacity = fixedSchedule.capacity;

          const newAppointments = oldSchedule.appointments.map((d, i) => {
            return this.appointmentRepository.create({
              ...d,
              appointmentStatus: i + 1 <= capacity ? 'scheduled' : 'cancel',
              id: undefined,
            });
          });

          const newAppointmensSaved =
            await queryRunner.manager.save(newAppointments);

          const newSchedule = await queryRunner.manager.save(
            this.scheduleRepository.create({
              capacity: fixedSchedule.capacity,
              appointments: newAppointmensSaved.filter(
                (d) => d.appointmentStatus === 'scheduled',
              ),
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

          const movedToSchedule = new Schedule();
          movedToSchedule.id = newSchedule.id;

          oldSchedule.movedTo = movedToSchedule;
          oldSchedule.status = 'changed';

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

      return { fixedSchedule, skippedSchedule, changedSchedule };
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

  async deleteFixedSchedule(body: FixedScheduleDeleteDTO) {
    const fixedSchedule = await this.fixedScheduleRepository.findOne({
      where: {
        id: body.id,
        schedule: {
          date: MoreThan(dayjs().add(1, 'day').toDate()),
        },
      },
      relations: {
        schedule: {
          appointments: true,
        },
      },
    });

    if (!fixedSchedule) {
      throw new ResponseError(
        'Fixed Schedule not found',
        StatusCodes.BAD_REQUEST,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.startTransaction();

      if (body.deleteSchedule) {
        let appointments: Appointment[] = [];

        const schedules = fixedSchedule.schedule.map((d) => {
          const appointmentTemp = d.appointments.map((da) =>
            this.appointmentRepository.create({
              ...da,
              appointmentStatus: 'cancel',
            }),
          );

          appointments = [...appointments, ...appointmentTemp];

          return this.scheduleRepository.create({
            ...d,
            status: 'cancelled',
            fixedSchedule: null,
          });
        });

        await queryRunner.manager.save(appointments);

        await queryRunner.manager.save(schedules);
      } else {
        const schedules = fixedSchedule.schedule.map((d) =>
          this.scheduleRepository.create({ ...d, fixedSchedule: null }),
        );

        await queryRunner.manager.save(schedules);
      }

      await queryRunner.manager.delete('FixedSchedule', { id: body.id });

      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();

      await queryRunner.release();

      throw e;
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cronScheduleGenerate() {
    const lastUpdateDaysAgo = dayjs().subtract(3, 'weeks').toDate();

    let newSchedulesCount = 0;

    let skippedSchedule: string[] = [];

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
      const generatedSchedules = await this.generateSchedule(fixedSchedules[i]);

      newSchedulesCount =
        newSchedulesCount + generatedSchedules.schedules.length;

      skippedSchedule = [
        ...skippedSchedule,
        ...generatedSchedules.skippedSchedule,
      ];
    }

    this.log.info(
      `${fixedSchedules.length} fixed schedule generated, ${newSchedulesCount} new schedules and ${skippedSchedule.length} schedules skipped because intersecting date, room and time with other schedule`,
    );
  }

  async createSchedule(body: ScheduleCreateDTO) {
    try {
      const isScheduleOverlap = await this.checkScheduleOverlap(
        dayjs(body.date, 'YYYY-MM-DD').toDate(),
        body.startTime,
        body.endTime,
        body.roomId,
      );

      if (isScheduleOverlap) {
        throw new ResponseError(
          'Ruangan sudah terisi pada tanggal dan jam tersebut',
          StatusCodes.CONFLICT,
        );
      }

      const room = new Room();
      room.id = body.roomId;

      const doctor = new Doctor();
      doctor.id = body.doctorId;

      const schedule = this.scheduleRepository.create({
        capacity: body.capacity,
        date: dayjs(body.date, 'YYYY-MM-DD').toDate(),
        doctor,
        endTime: body.endTime,
        room,
        startTime: body.startTime,
        type: 'special',
        status: 'ready',
      });

      await this.scheduleRepository.save(schedule);

      return schedule;
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

  async changeSchedule(body: ScheduleChangeDTO) {
    try {
      const isScheduleOverlap = await this.checkScheduleOverlap(
        dayjs(body.date, 'YYYY-MM-DD').toDate(),
        body.startTime,
        body.endTime,
        body.roomId,
      );

      if (isScheduleOverlap) {
        throw new ResponseError(
          'Ruangan sudah terisi pada tanggal dan jam tersebut',
          StatusCodes.CONFLICT,
        );
      }

      const oldSchedule = await this.scheduleRepository.findOne({
        where: {
          id: body.id,
        },
        relations: {
          doctor: {
            specialization: true,
          },
          room: true,
          appointments: {
            patient: true,
          },
        },
        order: {
          appointments: {
            id: 'ASC',
          },
        },
      });

      if (!oldSchedule) {
        throw new ResponseError('Schedule not found', StatusCodes.NOT_FOUND);
      }

      const queryRunner = this.dataSource.createQueryRunner();

      await queryRunner.startTransaction();

      try {
        const capacity = oldSchedule.capacity;

        const newAppointments = oldSchedule.appointments.map((d, i) => {
          return this.appointmentRepository.create({
            ...d,
            appointmentStatus: i + 1 <= capacity ? 'scheduled' : 'cancel',
            id: undefined,
          });
        });

        const newAppointmensSaved =
          await queryRunner.manager.save(newAppointments);

        const newRoom = new Room();
        newRoom.id = body.roomId;

        const newSchedule = await queryRunner.manager.save(
          this.scheduleRepository.create({
            capacity: body.capacity,
            appointments: newAppointmensSaved.filter(
              (d) => d.appointmentStatus === 'scheduled',
            ),
            date: dayjs(body.date, 'YYYY-MM-DD').toDate(),
            doctor: oldSchedule.doctor,
            endTime: body.endTime,
            fixedSchedule: oldSchedule.fixedSchedule,
            room: newRoom,
            startTime: body.startTime,
            status: 'ready',
            type: oldSchedule.type,
          }),
        );

        const movedScheduleTo = new Schedule();
        movedScheduleTo.id = newSchedule.id;

        oldSchedule.movedTo = movedScheduleTo;
        oldSchedule.status = 'changed';

        const oldAppointments = oldSchedule.appointments.map((d) =>
          this.appointmentRepository.create({
            ...d,
            appointmentStatus: 'cancel',
          }),
        );

        await queryRunner.manager.save(oldAppointments);

        oldSchedule.appointments = oldAppointments;

        await queryRunner.manager.save(oldSchedule);

        await queryRunner.commitTransaction();
      } catch (e) {
        console.log(e);
        await queryRunner.rollbackTransaction();

        await queryRunner.release();

        throw e;
      }

      return true;
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

  async approvalSchedule(body: ScheduleApprovalDTO) {
    try {
      const oldSchedule = await this.scheduleRepository.findOne({
        where: {
          id: body.id,
        },
        relations: {
          room: true,
          appointments: true,
        },
        order: {
          appointments: {
            id: 'ASC',
          },
        },
      });

      if (!oldSchedule) {
        throw new ResponseError('Schedule not found', StatusCodes.NOT_FOUND);
      }

      const tempSchedule = await this.scheduleTempRepository.findOne({
        where: {
          status: 'waiting',
          oldSchedule: {
            id: body.id,
          },
        },
        relations: {
          doctor: true,
        },
        order: {
          id: 'DESC',
        },
      });

      const queryRunner = this.dataSource.createQueryRunner();

      await queryRunner.startTransaction();

      try {
        if (body.action === 'cancel') {
          oldSchedule.status = 'cancelled';

          const appointments = oldSchedule.appointments.map((d) =>
            this.appointmentRepository.create({
              ...d,
              appointmentStatus: 'cancel',
            }),
          );

          await queryRunner.manager.save(oldSchedule);

          await queryRunner.manager.save(appointments);
        } else if (body.action === 'reject') {
          oldSchedule.status = 'ready';

          if (tempSchedule) {
            tempSchedule.status = 'cancelled';
            await queryRunner.manager.save(tempSchedule);
          }

          await queryRunner.manager.save(oldSchedule);
        } else {
          const capacity = tempSchedule.capacity;

          const room = new Room();
          room.id = body.roomId;

          const isScheduleOverlap = await this.checkScheduleOverlap(
            dayjs(tempSchedule.date, 'YYYY-MM-DD').toDate(),
            tempSchedule.startTime,
            tempSchedule.endTime,
            room.id,
          );

          if (isScheduleOverlap) {
            throw new ResponseError(
              'Ruangan sudah terisi pada tanggal dan jam tersebut',
              StatusCodes.CONFLICT,
            );
          }

          const newAppointments = oldSchedule.appointments.map((d, i) => {
            return this.appointmentRepository.create({
              ...d,
              appointmentStatus: i + 1 <= capacity ? 'scheduled' : 'cancel',
              id: undefined,
            });
          });

          const newAppointmensSaved =
            await queryRunner.manager.save(newAppointments);

          const newSchedule = await queryRunner.manager.save(
            this.scheduleRepository.create({
              capacity: tempSchedule.capacity,
              appointments: newAppointmensSaved.filter(
                (d) => d.appointmentStatus === 'scheduled',
              ),
              date: dayjs(tempSchedule.date).toDate(),
              doctor: tempSchedule.doctor,
              endTime: tempSchedule.endTime,
              room,
              startTime: tempSchedule.startTime,
              status: 'ready',
              type: 'regular',
            }),
          );

          const movedScheduleTo = new Schedule();
          movedScheduleTo.id = newSchedule.id;

          oldSchedule.movedTo = movedScheduleTo;
          oldSchedule.status = 'changed';

          const oldAppointments = oldSchedule.appointments.map((d) =>
            this.appointmentRepository.create({
              ...d,
              appointmentStatus: 'cancel',
            }),
          );

          await queryRunner.manager.save(oldAppointments);

          oldSchedule.appointments = oldAppointments;

          await queryRunner.manager.save(oldSchedule);

          await queryRunner.manager.save(newSchedule);

          tempSchedule.status = 'cancelled';

          await queryRunner.manager.save(tempSchedule);
        }

        await queryRunner.commitTransaction();
      } catch (e) {
        await queryRunner.rollbackTransaction();
        throw e;
      } finally {
        await queryRunner.release();
      }
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
