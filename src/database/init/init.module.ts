import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'src/module/logger/logger.module';
import { InitDatabaseService } from './init.service';
import { Staff } from '../entities/staff.entity';

@Module({
  imports: [LoggerModule, TypeOrmModule.forFeature([Staff])],
  providers: [InitDatabaseService],
})
export class InitDatabaseModule {}
