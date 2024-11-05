import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { StaffRole } from 'src/database/entities/staff.entity';
import { Roles } from 'src/decorator/role.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt.guards';
import { RoleGuard } from '../../auth/guards/role.guards';
import { LoggerService } from 'src/module/logger/logger.service';
import { AppointmentDoctorService } from './appointment.service';
import { UserDTO } from '../../auth/model/auth.dto';
import { Request } from 'express';
import { sendResponse } from 'src/utils/api.utils';

@Controller('')
@Roles(StaffRole.MANAGEMENT, StaffRole.DOCTOR)
@UseGuards(JwtAuthGuard, RoleGuard)
export class AppointmentDoctorController {
  constructor(
    private log: LoggerService,
    private appointmentService: AppointmentDoctorService,
  ) {}

  @Get('')
  async getCurrentAppointment(@Req() req: Request) {
    const user = req.user as UserDTO;

    const result = await this.appointmentService.getCurrentAppointment({
      user,
    });

    console.log(result);

    return 'yes';
  }
}
