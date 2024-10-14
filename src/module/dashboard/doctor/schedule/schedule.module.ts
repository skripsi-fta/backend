import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from 'src/database/entities/doctor.entity';
import { FixedSchedule } from 'src/database/entities/fixedschedule.entity';
import { Schedule } from 'src/database/entities/schedule.entity';
import { LoggerModule } from 'src/module/logger/logger.module';
import { Room } from 'src/database/entities/room.entity';
import { Appointment } from 'src/database/entities/appointment.entitity';
import { ScheduleDoctorController } from './schedule.controller';
import { ScheduleDoctorService } from './schedule.service';
import { ScheduleTemp } from 'src/database/entities/scheduletemp.entity';
import { ScheduleManagementModule } from '../../management/schedule/schedule.module';

@Module({
  imports: [
    LoggerModule,
    TypeOrmModule.forFeature([
      Doctor,
      Schedule,
      FixedSchedule,
      Room,
      Appointment,
      ScheduleTemp,
    ]),
    ScheduleManagementModule,
  ],
  controllers: [ScheduleDoctorController],
  providers: [ScheduleDoctorService],
})
export class ScheduleDoctorModule {}
