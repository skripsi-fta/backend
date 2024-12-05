import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from 'src/database/entities/appointment.entitity';
import { LoggerModule } from 'src/module/logger/logger.module';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { Auth } from 'src/database/entities/auth.entitity';
import { Patient } from 'src/database/entities/patient.entity';
import { Schedule } from 'src/database/entities/schedule.entity';
import { LivequeueModule } from 'src/module/livequeue/livequeue.module';

@Module({
  imports: [
    LoggerModule,
    TypeOrmModule.forFeature([Appointment, Auth, Patient, Schedule]),
    LivequeueModule,
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
})
export class AppointmentModule {}
