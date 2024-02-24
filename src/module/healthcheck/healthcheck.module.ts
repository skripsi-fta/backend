import { Module } from '@nestjs/common';
import { HealthcheckController } from './healthcheck.controller';
import { LoggerModule } from 'src/module/logger/logger.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Health } from 'src/database/entities/health.entity';

@Module({
  imports: [LoggerModule, TypeOrmModule.forFeature([Health])],
  controllers: [HealthcheckController],
})
export class HealthcheckModule {}
