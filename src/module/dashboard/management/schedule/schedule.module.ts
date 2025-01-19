import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from 'src/database/entities/doctor.entity';
import { FixedSchedule } from 'src/database/entities/fixedschedule.entity';
import { Schedule } from 'src/database/entities/schedule.entity';
import { LoggerModule } from 'src/module/logger/logger.module';
import { ScheduleManagementController } from './schedule.controller';
import { ScheduleManagementService } from './schedule.service';
import { Room } from 'src/database/entities/room.entity';
import { Appointment } from 'src/database/entities/appointment.entitity';
import { ScheduleTemp } from 'src/database/entities/scheduletemp.entity';

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
  ],
  controllers: [ScheduleManagementController],
  providers: [ScheduleManagementService],
  exports: [ScheduleManagementService],
})
export class ScheduleManagementModule {}
