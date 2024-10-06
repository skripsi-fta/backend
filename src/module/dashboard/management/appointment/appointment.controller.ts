import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from 'src/database/entities/appointment.entitity';
import { Repository } from 'typeorm';
import { AppointmentPostDTO } from './model/appointment.dto';
import { sendResponse } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';
import { Response } from 'express';

@Controller('')
export class AppointmentController {
  constructor(
    private appointmentService: AppointmentService,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  @Get()
  async getAppointment(
    @Res() res: Response,
    @Query('id') id: number,
    @Query('bookingCode') bookingCode: string,
    @Query('appointmentStatus') appointmentStatus: string,
    @Query('pageSize', new DefaultValuePipe(0)) pageSize: number,
    @Query('pageNumber', new DefaultValuePipe(1)) pageNumber: number,
  ) {
    const data = await this.appointmentService.getAppointment(
      pageSize,
      pageNumber,
      id,
      bookingCode,
      appointmentStatus,
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
    // const appointmentExist = await this.appointmentRepository.findOne({
    //   where: [{ bookingCode: req.bookingCode }],
    // });

    // if (appointmentExist) {
    //   return sendResponse(res, {
    //     statusCode: StatusCodes.CONFLICT,
    //     message: 'Error - Appointment already exist',
    //   });
    // }

    const data = await this.appointmentService.addAppointment(req);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - Add Appointment',
      data: data,
    });
  }
}
