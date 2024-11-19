import {
  Logger,
  Module,
  type MiddlewareConsumer,
  type NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { loggerData } from './utils/logger.util';
import { HealthcheckModule } from './module/healthcheck/healthcheck.module';
import { LoggerModule } from './module/logger/logger.module';
import config from './config';
import { TypeOrmModule } from '@nestjs/typeorm';
import dataSource from './database/datasource';
import { DashboardModule } from './module/dashboard/dashboard.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { ScheduleModule } from '@nestjs/schedule';
import { MobileModule } from './module/mobile/mobile.module';

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
    DashboardModule,
    MobileModule,
    ScheduleModule.forRoot(),
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
