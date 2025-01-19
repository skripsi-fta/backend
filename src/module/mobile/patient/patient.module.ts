import { Module } from '@nestjs/common';
import { PatientController } from './patient.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from 'src/database/entities/patient.entity';
import { LoggerModule } from 'src/module/logger/logger.module';
import { PatientService } from './patient.service';
import { Auth } from 'src/database/entities/auth.entitity';

@Module({
  imports: [LoggerModule, TypeOrmModule.forFeature([Patient, Auth])],
  controllers: [PatientController],
  providers: [PatientService],
})
export class PatientModule {}
