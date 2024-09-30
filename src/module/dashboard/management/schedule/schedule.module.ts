import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from 'src/database/entities/doctor.entity';
import { FixedSchedule } from 'src/database/entities/fixedschedule.entity';
import { Schedule } from 'src/database/entities/schedule.entity';
import { LoggerModule } from 'src/module/logger/logger.module';
import { ScheduleManagementController } from './schedule.controller';

@Module({
  imports: [
    LoggerModule,
    TypeOrmModule.forFeature([Doctor, Schedule, FixedSchedule]),
  ],
  controllers: [ScheduleManagementController],
})
export class ScheduleManagementModule {}
