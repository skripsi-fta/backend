import { Controller, DefaultValuePipe, Get, Query, Res } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import type { Response } from 'express';
import { sendResponse } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';

@Controller('')
export class ScheduleController {
  constructor(private scheduleService: ScheduleService) {}

  @Get('')
  async getSchedule(
    @Res() res: Response,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('pageSize', new DefaultValuePipe(10)) pageSize: number,
    @Query('pageNumber', new DefaultValuePipe(1)) pageNumber: number,
  ) {
    const data = await this.scheduleService.getSchedule(
      startDate,
      endDate,
      pageSize,
      pageNumber,
    );

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - Get Schedule',
      data,
    });
  }
}
