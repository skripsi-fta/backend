import { Controller, DefaultValuePipe, Get, Query, Res } from '@nestjs/common';
import { SpecializationService } from './specialization.service';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { sendResponse } from 'src/utils/api.utils';

@Controller('')
export class SpecializationController {
  constructor(private specializationService: SpecializationService) {}

  @Get('')
  async getSpesialisasi(
    @Res() res: Response,
    @Query('name') name: string,
    @Query('pageSize', new DefaultValuePipe(10)) pageSize: number,
    @Query('pageNumber', new DefaultValuePipe(1)) pageNumber: number,
  ) {
    const data = await this.specializationService.getSpecialization(
      name,
      pageSize,
      pageNumber,
    );

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - Get Specialization',
      data,
    });
  }
}
