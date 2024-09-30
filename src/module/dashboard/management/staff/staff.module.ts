import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from 'src/database/entities/staff.entity';
import { Doctor } from 'src/database/entities/doctor.entity';
import { LoggerModule } from 'src/module/logger/logger.module';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';

@Module({
  imports: [LoggerModule, TypeOrmModule.forFeature([Staff, Doctor])],
  controllers: [StaffController],
  providers: [StaffService],
})
export class StaffModule {}
