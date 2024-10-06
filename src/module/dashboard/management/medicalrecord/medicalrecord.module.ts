import { Module } from '@nestjs/common';
import { MedicalrecordController } from './medicalrecord.controller';
import { LoggerModule } from 'src/module/logger/logger.module';
import { MedicalrecordService } from './medicalrecord.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from 'src/database/entities/patient.entity';
import { MedicalRecord } from 'src/database/entities/medicalrecord.entity';

@Module({
  imports: [LoggerModule, TypeOrmModule.forFeature([Patient, MedicalRecord])],
  controllers: [MedicalrecordController],
  providers: [MedicalrecordService],
})
export class MedicalrecordModule {}
