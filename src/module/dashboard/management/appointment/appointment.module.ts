import { Module } from '@nestjs/common';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { LoggerModule } from 'src/module/logger/logger.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from 'src/database/entities/appointment.entitity';
import { Patient } from 'src/database/entities/patient.entity';
import { Schedule } from 'src/database/entities/schedule.entity';
import { MedicalRecord } from 'src/database/entities/medicalrecord.entity';
import { LivequeueModule } from 'src/module/livequeue/livequeue.module';

@Module({
  imports: [
    LoggerModule,
    TypeOrmModule.forFeature([Appointment, Patient, Schedule, MedicalRecord]),
    LivequeueModule,
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
})
export class AppointmentModule {}
