import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { sendResponse } from 'src/utils/api.utils';
import { HealthCheckPostDTO } from './healthcheck.dto';
import { LoggerService } from 'src/module/logger/logger.service';
import { Repository } from 'typeorm';
import { Health } from 'src/database/entities/health.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('healthcheck')
export class HealthcheckController {
  constructor(
    private loggerService: LoggerService,
    @InjectRepository(Health) private healthRepository: Repository<Health>,
  ) {}

  @Get()
  async getHealth(@Res() res: Response) {
    this.loggerService.log('Health Check GET');

    await this.healthRepository.insert({ type: 'get' });
    const healthdatas = await this.healthRepository.find();

    return sendResponse(res, {
      message: 'GET Health Check Success',
      data: healthdatas,
    });
  }

  @Post()
  async postHealth(@Res() res: Response, @Body() body: HealthCheckPostDTO) {
    this.loggerService.log('Health Check POST');
    await this.healthRepository.insert({ type: 'post' });

    return sendResponse(res, {
      message: 'POST Health Check Success',
      data: { message: body.message },
    });
  }
}
