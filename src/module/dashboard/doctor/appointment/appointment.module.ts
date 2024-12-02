import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from 'src/database/entities/doctor.entity';
import { FixedSchedule } from 'src/database/entities/fixedschedule.entity';
import { Schedule } from 'src/database/entities/schedule.entity';
import { LoggerModule } from 'src/module/logger/logger.module';
import { Room } from 'src/database/entities/room.entity';
import { Appointment } from 'src/database/entities/appointment.entitity';
import { ScheduleTemp } from 'src/database/entities/scheduletemp.entity';
import { AppointmentDoctorController } from './appointment.controller';
import { AppointmentDoctorService } from './appointment.service';
import { Staff } from 'src/database/entities/staff.entity';
import { PharmacyQueue } from 'src/database/entities/pharmacyqueue.entity';
import { LivequeueModule } from 'src/module/livequeue/livequeue.module';

@Module({
  imports: [
    LoggerModule,
    LivequeueModule,
    TypeOrmModule.forFeature([
      Schedule,
      Appointment,
      Doctor,
      FixedSchedule,
      Room,
      ScheduleTemp,
      Staff,
      PharmacyQueue,
    ]),
  ],
  controllers: [AppointmentDoctorController],
  providers: [AppointmentDoctorService],
})
export class AppointmentDoctorModule {}
