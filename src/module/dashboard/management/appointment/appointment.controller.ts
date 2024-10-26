import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentPostDTO, AppointmentPutDTO } from './model/appointment.dto';
import { sendResponse } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';
import { Response } from 'express';
import { AppointmentStatus } from 'src/database/entities/appointment.entitity';

@Controller('')
export class AppointmentController {
  constructor(private appointmentService: AppointmentService) {}

  @Get()
  async getAppointment(
    @Res() res: Response,
    @Query('id') id: number,
    @Query('bookingCode') bookingCode: string,
    @Query('appointmentStatus') appointmentStatus: string,
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
    @Query('pageSize', new DefaultValuePipe(0)) pageSize: number,
    @Query('pageNumber', new DefaultValuePipe(1)) pageNumber: number,
  ) {
    const data = await this.appointmentService.getAppointment(
      pageSize,
      pageNumber,
      id,
      bookingCode,
      appointmentStatus,
      fromDate,
      toDate,
    );

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - Get Appointment',
      pageSize: Number(pageSize) || 0,
      pageNumber: Number(pageNumber) || 1,
      totalRows: data.totalRows,
      data: data.list,
    });
  }

  @Post()
  async addAppointment(@Res() res: Response, @Body() req: AppointmentPostDTO) {
    const data = await this.appointmentService.addAppointment(req);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - Add Appointment',
      data: data,
    });
  }

  @Put()
  async updateAppointment(
    @Res() res: Response,
    @Body() req: AppointmentPutDTO,
  ) {
    const data = await this.appointmentService.updateAppointment(req);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - Update Appointment',
      data: data,
    });
  }

  @Post('checkin')
  async checkInAppointment(
    @Res() res: Response,
    @Body() req: { bookingCode: string },
  ) {
    console.log(req.bookingCode);
    const data = await this.appointmentService.updateAppointmentStatus(
      req.bookingCode,
      AppointmentStatus.CHECKIN,
    );

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - Check In Appointment',
      data: data,
    });
  }
}
