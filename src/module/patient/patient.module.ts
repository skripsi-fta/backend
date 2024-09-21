import { Module } from '@nestjs/common';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import { LoggerModule } from '../logger/logger.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from 'src/database/entities/patient.entity';

@Module({
  imports: [LoggerModule, TypeOrmModule.forFeature([Patient])],
  controllers: [PatientController],
  providers: [PatientService],
})
export class PatientModule {}
