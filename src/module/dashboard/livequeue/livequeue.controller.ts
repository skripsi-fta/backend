import { Controller, Get, Res } from '@nestjs/common';
import { LoggerService } from '../../logger/logger.service';
import { sendResponse } from 'src/utils/api.utils';
import { Response } from 'express';
import { LivequeueService } from './livequeue.service';

@Controller('')
export class LiveQueueController {
  constructor(
    private log: LoggerService,
    private liveQueueService: LivequeueService,
  ) {}

  @Get('pharmacy')
  async getPharmacyQueue(@Res() res: Response) {
    const data = await this.liveQueueService.getLivePharmacyQueue();

    return sendResponse(res, {
      statusCode: 200,
      message: 'Success - Get Live Pharmacy Queue',
      data: data,
    });
  }

  @Get('cashier')
  async getCashierQueue(@Res() res: Response) {
    const data = await this.liveQueueService.getLiveCashierQueue();

    return sendResponse(res, {
      statusCode: 200,
      message: 'Success - Get Live Cashier Queue',
      data: data,
    });
  }

  @Get('doctor')
  async getDoctorQueue(@Res() res: Response) {
    const data = await this.liveQueueService.getLiveDoctorQueue();

    return sendResponse(res, {
      statusCode: 200,
      message: 'Success - Get Live Doctor Queue',
      data: data,
    });
  }

  @Get('global')
  async getGlobalQueue(@Res() res: Response) {
    const data = await this.liveQueueService.getGlobalQueue();

    return sendResponse(res, {
      statusCode: 200,
      message: 'Success - Get Live Global Queue',
      data: data,
    });
  }
}
