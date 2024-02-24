import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { sendResponse } from 'src/utils/api.utils';
import { HealthCheckPostDTO } from './healthcheck.dto';
import { LoggerService } from 'src/logger/logger.service';

@Controller('healthcheck')
export class HealthcheckController {
  constructor(private loggerService: LoggerService) {}

  @Get()
  async getHealth(@Res() res: Response) {
    this.loggerService.log('Health Check GET');
    return sendResponse(res, { message: 'GET Health Check Success' });
  }

  @Post()
  async postHealth(@Res() res: Response, @Body() body: HealthCheckPostDTO) {
    this.loggerService.log('Health Check POST');
    return sendResponse(res, {
      message: 'POST Health Check Success',
      data: { message: body.message },
    });
  }
}
