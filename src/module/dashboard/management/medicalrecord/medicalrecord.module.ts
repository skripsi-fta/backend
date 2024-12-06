import { Module } from '@nestjs/common';
import { MedicalrecordController } from './medicalrecord.controller';
import { LoggerModule } from 'src/module/logger/logger.module';
import { MedicalrecordService } from './medicalrecord.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from 'src/database/entities/patient.entity';
import { MedicalRecord } from 'src/database/entities/medicalrecord.entity';
import { Appointment } from 'src/database/entities/appointment.entitity';
import { DoctorQueue } from 'src/database/entities/doctorqueue.entity';
import { LivequeueModule } from 'src/module/dashboard/livequeue/livequeue.module';

@Module({
  imports: [
    LoggerModule,
    TypeOrmModule.forFeature([
      Patient,
      MedicalRecord,
      Appointment,
      DoctorQueue,
    ]),
    LivequeueModule,
  ],
  controllers: [MedicalrecordController],
  providers: [MedicalrecordService],
})
export class MedicalrecordModule {}
