import { Module } from '@nestjs/common';
import { LiveQueueGateaway } from './livequeuegateaway';
import { LoggerModule } from '../../logger/logger.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from 'src/database/entities/appointment.entitity';
import { LiveQueueController } from './livequeue.controller';
import { LivequeueService } from './livequeue.service';

@Module({
  imports: [LoggerModule, TypeOrmModule.forFeature([Appointment])],
  controllers: [LiveQueueController],
  providers: [LiveQueueGateaway, LivequeueService],
  exports: [LiveQueueGateaway, LivequeueService],
})
export class LivequeueModule {}
