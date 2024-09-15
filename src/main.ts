import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonModule } from 'nest-winston';
import { logger } from './utils/logger.util';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: false,
    logger: WinstonModule.createLogger(logger),
  });

  const configService = app.get(ConfigService);
  const isDev = configService.get<boolean>('isDev');

  app.use(helmet());
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      disableErrorMessages: !isDev,
      exceptionFactory: isDev
        ? (errors) => {
            const result = errors.map((error) => ({
              property: error.property,
              message: error.constraints[Object.keys(error.constraints)[0]],
            }));

            return new BadRequestException(
              result,
              'Wrong Body, Please Check DTO',
            );
          }
        : null,
    }),
  );

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.setGlobalPrefix('v1');

  await app.listen(configService.get<number>('port'));
  logger.info(`Backend is running on: ${await app.getUrl()}`);
}

bootstrap();
