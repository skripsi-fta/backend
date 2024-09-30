import { Module } from '@nestjs/common';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from 'src/database/entities/doctor.entity';
import { Specialization } from 'src/database/entities/specialization.entity';
import { LoggerModule } from 'src/module/logger/logger.module';

@Module({
  imports: [LoggerModule, TypeOrmModule.forFeature([Doctor, Specialization])],
  controllers: [DoctorController],
  providers: [DoctorService],
})
export class DoctorModule {}
