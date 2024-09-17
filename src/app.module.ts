import {
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { loggerData } from './utils/logger.util';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { HealthcheckModule } from './module/healthcheck/healthcheck.module';
import { LoggerModule } from './module/logger/logger.module';
import config from './config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffModule } from './module/staff/staff.module';
import dataSource from './database/datasource';
import { DoctorModule } from './module/doctor/doctor.module';
import { RoomModule } from './module/room/room.module';
import { SpecializationModule } from './module/specialization/specialization.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: dataSource,
      inject: [ConfigService],
    }),
    WinstonModule.forRoot(loggerData),
    HealthcheckModule,
    LoggerModule,
    StaffModule,
    DoctorModule,
    RoomModule,
    SpecializationModule,
  ],
  controllers: [AppController],
  providers: [Logger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
