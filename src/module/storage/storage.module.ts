import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { MulterModule } from '@nestjs/platform-express';
import { StorageController } from './storage.controller';
import * as multer from 'multer';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    MulterModule.register({
      storage: multer.memoryStorage(),
    }),
    RouterModule.register([
      {
        path: 'storage',
        module: StorageModule,
      },
    ]),
  ],
  providers: [StorageService],
  exports: [StorageService],
  controllers: [StorageController],
})
export class StorageModule {}
