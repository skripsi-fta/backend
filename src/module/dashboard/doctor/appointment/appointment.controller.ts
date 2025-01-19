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
import { StaffRole } from 'src/database/entities/staff.entity';
import { Roles } from 'src/decorator/role.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt.guards';
import { RoleGuard } from '../../auth/guards/role.guards';
import { LoggerService } from 'src/module/logger/logger.service';
import { AppointmentDoctorService } from './appointment.service';
import { UserDTO } from '../../auth/model/auth.dto';
import { Request, Response } from 'express';
import { sendResponse } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';
import type { CheckAppointmentDTO } from './model/appointment.dto';
import { LiveQueueGateaway } from 'src/module/dashboard/livequeue/livequeuegateaway';

@Controller('')
@Roles(StaffRole.MANAGEMENT, StaffRole.DOCTOR)
@UseGuards(JwtAuthGuard, RoleGuard)
export class AppointmentDoctorController {
  constructor(
    private log: LoggerService,
    private appointmentService: AppointmentDoctorService,
    private liveQueueGateaway: LiveQueueGateaway,
  ) {}

  @Get('')
  async getDetailCurrentAppointment(@Req() req: Request, @Res() res: Response) {
    const user = req.user as UserDTO;

    const result = await this.appointmentService.getDetailCurrentAppointment({
      user,
    });

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - GET Current Appointment',
      data: result,
    });
  }

  @Get('list')
  async getListAppointment(
    @Res() res: Response,
    @Query('pageSize', new DefaultValuePipe(0))
    pageSize: number,
    @Query('pageNumber', new DefaultValuePipe(1)) pageNumber: number,
    @Query('scheduleId') scheduleId: number,
  ) {
    const data = await this.appointmentService.getListAppointment({
      pageNumber,
      pageSize,
      scheduleId,
    });

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - GET List Appointment',
      pageSize: Number(pageSize) || 0,
      pageNumber: Number(pageNumber) || 1,
      totalRows: data.totalRows,
      data: data.list,
    });
  }

  @Post('check')
  async checkAppointment(
    @Res() res: Response,
    @Body() body: CheckAppointmentDTO,
  ) {
    const data = await this.appointmentService.checkAppointment(body);

    this.liveQueueGateaway.sendQueueData('queue', 'pharmacy');

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - POST Check Appointment',
      data,
    });
  }
}
