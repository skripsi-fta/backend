import { Module } from '@nestjs/common';
import { HealthcheckController } from './healthcheck.controller';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  controllers: [HealthcheckController],
  imports: [LoggerModule],
})
export class HealthcheckModule {}
