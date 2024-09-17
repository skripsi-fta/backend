import { Module } from '@nestjs/common';
import { Specialization } from 'src/database/entities/specialization.entity';
import { SpecializationController } from './specialization.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpecializationService } from './specialization.service';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [LoggerModule, TypeOrmModule.forFeature([Specialization])],
  controllers: [SpecializationController],
  providers: [SpecializationService],
})
export class SpecializationModule {}
