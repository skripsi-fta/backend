import { Controller, DefaultValuePipe, Get, Query, Res } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { sendResponse } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';
import { Response } from 'express';

@Controller('')
export class DoctorController {
  constructor(private doctorService: DoctorService) {}

  @Get('recommendation')
  async getRecommendation(
    @Res() res: Response,
    @Query('total', new DefaultValuePipe(3)) total: number,
  ) {
    const data = await this.doctorService.getRecommendation(total);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - Get Doctor Recommendation',
      data,
    });
  }

  @Get('')
  async getDoctor(
    @Res() res: Response,
    @Query('name') name: string,
    @Query('pageSize', new DefaultValuePipe(10)) pageSize: number,
    @Query('pageNumber', new DefaultValuePipe(1)) pageNumber: number,
  ) {
    const data = await this.doctorService.getDoctor(name, pageSize, pageNumber);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - Get Doctor Recommendation',
      data,
    });
  }
}
