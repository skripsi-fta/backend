import { Module } from '@nestjs/common';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from 'src/database/entities/doctor.entity';
import { Specialization } from 'src/database/entities/specialization.entity';
import { LoggerModule } from 'src/module/logger/logger.module';
import { StorageModule } from 'src/module/storage/storage.module';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';

@Module({
  imports: [
    LoggerModule,
    TypeOrmModule.forFeature([Doctor, Specialization]),
    MulterModule.register({
      storage: multer.memoryStorage(),
    }),
    StorageModule,
  ],
  controllers: [DoctorController],
  providers: [DoctorService],
})
export class DoctorManagementModule {}
