import { Module } from '@nestjs/common';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from 'src/database/entities/doctor.entity';
import { LoggerModule } from '../logger/logger.module';
import { Specialization } from 'src/database/entities/specialization.entity';

@Module({
  imports: [LoggerModule, TypeOrmModule.forFeature([Doctor, Specialization])],
  controllers: [DoctorController],
  providers: [DoctorService],
})
export class DoctorModule {}
