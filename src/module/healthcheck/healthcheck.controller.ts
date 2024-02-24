import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { sendResponse } from 'src/utils/api.utils';
import { HealthCheckPostDTO } from './healthcheck.dto';
import { LoggerService } from 'src/module/logger/logger.service';
import { Repository } from 'typeorm';
import { Health } from 'src/database/entities/health.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Test } from 'src/database/entities/test.entity';

@Controller('healthcheck')
export class HealthcheckController {
  constructor(
    private loggerService: LoggerService,
    @InjectRepository(Health) private healthRepository: Repository<Health>,
    @InjectRepository(Test) private testRepository: Repository<Test>,
  ) {}

  @Get()
  async getHealth(@Res() res: Response) {
    this.loggerService.log('Health Check GET');

    await this.healthRepository.insert({ type: 'get' });
    const healthdatas = await this.healthRepository.find();
    const testdatas = await this.testRepository.find();

    return sendResponse(res, {
      message: 'GET Health Check Success',
      data: { health: healthdatas, test: testdatas },
    });
  }

  @Post()
  async postHealth(@Res() res: Response, @Body() body: HealthCheckPostDTO) {
    this.loggerService.log('Health Check POST');
    await this.healthRepository.insert({ type: 'post' });
    await this.testRepository.insert({ message: body.message });

    return sendResponse(res, {
      message: 'POST Health Check Success',
      data: { message: body.message },
    });
  }
}
