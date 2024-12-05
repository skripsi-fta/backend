import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guards';
import { AppointmentService } from './appointment.service';
import type { Request, Response } from 'express';
import type { CreateAppointmentDTO } from './model/appointment.dto';
import type { UserDTO } from '../auth/model/auth.dto';
import { sendResponse } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';

@Controller('')
@UseGuards(JwtAuthGuard)
export class AppointmentController {
  constructor(private appointmentService: AppointmentService) {}

  @Post('create')
  async createAppointment(
    @Res() res: Response,
    @Body() body: CreateAppointmentDTO,
    @Req() req: Request,
  ) {
    const user = req.user as UserDTO;

    const data = await this.appointmentService.createAppointment(user, body);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - Create Appointment',
      data,
    });
  }

  @Get('')
  async getListAppointment(
    @Res() res: Response,
    @Req() req: Request,
    @Query('pageSize', new DefaultValuePipe(10)) pageSize: number,
    @Query('pageNumber', new DefaultValuePipe(1)) pageNumber: number,
    @Query('type', new DefaultValuePipe('mendatang')) type: string,
  ) {
    const user = req.user as UserDTO;

    const data = await this.appointmentService.getListAppointment({
      pageNumber,
      pageSize,
      type,
      user,
    });

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - Get List Appointment',
      data,
    });
  }
}
