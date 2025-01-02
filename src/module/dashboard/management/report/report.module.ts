import { Module } from '@nestjs/common';
import { ReportManagementController } from './report.controller';
import { ReportManagementService } from './report.service';
import { LoggerModule } from 'src/module/logger/logger.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from 'src/database/entities/appointment.entitity';
import { Schedule } from 'src/database/entities/schedule.entity';
import { Doctor } from 'src/database/entities/doctor.entity';
import { DoctorQueue } from 'src/database/entities/doctorqueue.entity';
import { PharmacyQueue } from 'src/database/entities/pharmacyqueue.entity';
import { CashierQueue } from 'src/database/entities/cashierqueue.entity';
import { Specialization } from 'src/database/entities/specialization.entity';

@Module({
  imports: [
    LoggerModule,
    TypeOrmModule.forFeature([
      Appointment,
      Schedule,
      Doctor,
      DoctorQueue,
      PharmacyQueue,
      CashierQueue,
      Specialization,
    ]),
  ],
  controllers: [ReportManagementController],
  providers: [ReportManagementService],
})
export class ReportManagementModule {}
