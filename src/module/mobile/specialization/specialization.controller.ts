import { Controller, DefaultValuePipe, Get, Query, Res } from '@nestjs/common';
import { SpecializationService } from './specialization.service';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { sendResponse } from 'src/utils/api.utils';

@Controller('')
export class SpecializationController {
  constructor(private specializationService: SpecializationService) {}

  @Get('recommendation')
  async getRecommendation(
    @Res() res: Response,
    @Query('total', new DefaultValuePipe(5)) total: number,
  ) {
    const data = await this.specializationService.getRecommendation(total);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - Get Specialization Recommendation',
      data,
    });
  }
}
