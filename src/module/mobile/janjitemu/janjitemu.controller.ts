import { JwtAuthGuard } from '../auth/guards/jwt.guards';
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { sendResponse } from 'src/utils/api.utils';

@Controller('')
@UseGuards(JwtAuthGuard)
export class JanjiTemuController {
  @Get()
  async getSpecialization(@Res() res: Response) {
    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - GET Specialization',
    });
  }
}
