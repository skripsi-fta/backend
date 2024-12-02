import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PharmacyQueue } from 'src/database/entities/pharmacyqueue.entity';
import { LoggerModule } from 'src/module/logger/logger.module';
import { PharmacyController } from './pharmacy.controller';
import { PharmacyService } from './pharmacy.service';
import { Appointment } from 'src/database/entities/appointment.entitity';
import { CashierQueue } from 'src/database/entities/cashierqueue.entity';
import { LivequeueModule } from 'src/module/livequeue/livequeue.module';

@Module({
  imports: [
    LoggerModule,
    TypeOrmModule.forFeature([PharmacyQueue, CashierQueue, Appointment]),
    LivequeueModule,
  ],
  controllers: [PharmacyController],
  providers: [PharmacyService],
})
export class PharmacyModule {}
