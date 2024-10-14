import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { StaffRole } from 'src/database/entities/staff.entity';
import { Roles } from 'src/decorator/role.decorator';
import { RoleGuard } from '../../auth/guards/role.guards';
import { JwtAuthGuard } from '../../auth/guards/jwt.guards';
import { LoggerService } from 'src/module/logger/logger.service';
import { ScheduleDoctorService } from './schedule.service';
import type { RequestChangeScheduleDTO } from './model/schedule.dto';
import { sendResponse } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';
import type { Response } from 'express';

@Controller('')
@Roles(StaffRole.MANAGEMENT, StaffRole.DOCTOR)
@UseGuards(JwtAuthGuard, RoleGuard)
export class ScheduleDoctorController {
  constructor(
    private log: LoggerService,
    private scheduleService: ScheduleDoctorService,
  ) {}

  @Post('request')
  async requestChangeSchedule(
    @Res() res: Response,
    @Body() body: RequestChangeScheduleDTO,
  ) {
    const data = await this.scheduleService.requestChangeSchedule(body);

    return sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: 'Success - Request Schedule',
      data: data,
    });
  }
}
