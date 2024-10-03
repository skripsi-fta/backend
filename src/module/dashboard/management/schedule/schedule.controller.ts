import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { StaffRole } from 'src/database/entities/staff.entity';
import { Roles } from 'src/decorator/role.decorator';
import { RoleGuard } from '../../auth/guards/role.guards';
import { JwtAuthGuard } from '../../auth/guards/jwt.guards';
import { LoggerService } from 'src/module/logger/logger.service';
import { ScheduleManagementService } from './schedule.service';
import { sendResponse } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';
import { Response } from 'express';
import { ScheduleDay } from 'src/database/entities/fixedschedule.entity';
import type {
  FixedScheduleCreateDTO,
  FixedScheduleUpdateDTO,
} from './model/schedule.dto';

@Controller('')
@Roles(StaffRole.MANAGEMENT)
@UseGuards(JwtAuthGuard, RoleGuard)
export class ScheduleManagementController {
  constructor(
    private log: LoggerService,
    private scheduleService: ScheduleManagementService,
  ) {}

  @Get('fixed')
  async getFixedSchedule(
    @Res() res: Response,
    @Query('doctorId') doctorId: number,
    @Query('roomId') roomId: number,
    @Query('day') day: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @Query('pageSize', new DefaultValuePipe(0))
    pageSize: number,
    @Query('pageNumber', new DefaultValuePipe(1)) pageNumber: number,
  ) {
    if (
      day &&
      !Object.values(ScheduleDay).includes(day.toUpperCase() as ScheduleDay)
    ) {
      return sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Failed - Invalid day',
      });
    }

    const data = await this.scheduleService.getFixedSchedule({
      day,
      doctorId,
      pageNumber,
      pageSize,
      roomId,
      startTime,
      endTime,
    });

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - GET Fixed Schedule',
      pageSize: Number(pageSize) || 0,
      pageNumber: Number(pageNumber) || 1,
      totalRows: data.totalRows,
      data: data.list,
    });
  }

  @Post('fixed')
  async createFixedSchedule(
    @Res() res: Response,
    @Body() body: FixedScheduleCreateDTO,
  ) {
    const data = await this.scheduleService.createFixedSchedule(body);

    return sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: 'Success - Add Fixed Schedule',
      data: data,
    });
  }

  @Put('fixed')
  async updateFixedSchedule(
    @Res() res: Response,
    @Body() body: FixedScheduleUpdateDTO,
  ) {
    const data = await this.scheduleService.updateFixedSchedule(body);

    return sendResponse(res, {
      statusCode: StatusCodes.ACCEPTED,
      message: 'Success - Update Fixed Schedule',
      data,
    });
  }
}
