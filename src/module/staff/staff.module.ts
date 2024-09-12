import { Module } from '@nestjs/common';
import { StaffController } from './staff.controller';
import { LoggerModule } from '../logger/logger.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from 'src/database/entities/staff.entity';
import { StaffService } from './staff.service';
import { Doctor } from 'src/database/entities/doctor.entity';

@Module({
  imports: [LoggerModule, TypeOrmModule.forFeature([Staff, Doctor])],
  controllers: [StaffController],
  providers: [StaffService],
})
export class StaffModule {}
