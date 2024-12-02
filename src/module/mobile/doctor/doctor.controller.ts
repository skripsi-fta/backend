import { Controller, DefaultValuePipe, Get, Query, Res } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { ResponseError, sendResponse } from 'src/utils/api.utils';
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

  @Get('detail')
  async getDoctorDetail(
    @Res() res: Response,
    @Query('doctorId') doctorId: number,
  ) {
    if (!doctorId) {
      throw new ResponseError('Invalid Field Format', StatusCodes.BAD_REQUEST);
    }

    const data = await this.doctorService.getDoctorDetail(doctorId);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - Get Doctor Detail',
      data,
    });
  }

  @Get('schedule')
  async getDoctorSchedule(
    @Res() res: Response,
    @Query('doctorId') doctorId: number,
    @Query('monthNumber') monthNumber: number,
  ) {
    if (!doctorId || !monthNumber) {
      throw new ResponseError('Invalid Field Format', StatusCodes.BAD_REQUEST);
    }

    const data = await this.doctorService.getDoctorSchedule(
      doctorId,
      monthNumber,
    );

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - Get Doctor Schedule',
      data,
    });
  }
}
