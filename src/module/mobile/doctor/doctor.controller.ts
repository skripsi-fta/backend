import { Controller, DefaultValuePipe, Get, Query, Res } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { sendResponse } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';
import { Response } from 'express';

@Controller('')
export class DoctorController {
  constructor(private doctorService: DoctorService) {}

  @Get('')
  async getDoctor(
    @Res() res: Response,
    @Query('name') name: string,
    @Query('pageSize', new DefaultValuePipe(10)) pageSize: number,
    @Query('pageNumber', new DefaultValuePipe(1)) pageNumber: number,
    @Query('spesialisasiId') spesialisasiId: number,
  ) {
    const data = await this.doctorService.getDoctor(
      name,
      pageSize,
      pageNumber,
      spesialisasiId,
    );

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - Get Doctor Recommendation',
      data,
    });
  }
}
