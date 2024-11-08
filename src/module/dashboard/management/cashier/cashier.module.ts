import { Module } from '@nestjs/common';
import { CashierController } from './cashier.controller';
import { CashierService } from './cashier.service';
import { LoggerModule } from 'src/module/logger/logger.module';
import { Appointment } from 'src/database/entities/appointment.entitity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashierQueue } from 'src/database/entities/cashierqueue.entity';

@Module({
  imports: [
    LoggerModule,
    TypeOrmModule.forFeature([CashierQueue, Appointment]),
  ],
  controllers: [CashierController],
  providers: [CashierService],
})
export class CashierModule {}
