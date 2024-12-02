import { Module } from '@nestjs/common';
import { LiveQueueGateaway } from './livequeuegateaway';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [LoggerModule],
  providers: [LiveQueueGateaway],
})
export class LivequeueModule {}
