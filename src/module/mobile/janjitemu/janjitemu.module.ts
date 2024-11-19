import { Module } from '@nestjs/common';
import { Specialization } from 'src/database/entities/specialization.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'src/module/logger/logger.module';
import { JanjiTemuController } from './janjitemu.controller';

@Module({
  imports: [LoggerModule, TypeOrmModule.forFeature([Specialization])],
  controllers: [JanjiTemuController],
  //   providers: [SpecializationService],
})
export class JanjiTemuModule {}
