import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guards';
import { AppointmentService } from './appointment.service';
import type { Request, Response } from 'express';
import type { CreateAppointmentDTO } from './model/appointment.dto';
import type { UserDTO } from '../auth/model/auth.dto';
import { sendResponse } from 'src/utils/api.utils';

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

    return sendResponse(res, { message: 'Success - Create Appointment', data });
  }
}
