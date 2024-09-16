import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { sendResponse } from 'src/utils/api.utils';
import { Response } from 'express';
import { StaffPostDTO, StaffPutDTO } from './model/staff.dto';
import { StaffService } from './staff.service';
import { StatusCodes } from 'http-status-codes';
import { StaffRole } from 'src/database/entities/staff.entity';

@Controller('staff')
export class StaffController {
  constructor(
    private log: LoggerService,
    private staffService: StaffService,
  ) {}

  @Get()
  async getStaff(
    @Res() res: Response,
    @Query('id') id: number,
    @Query('role') role: string,
    @Query('name') name: string,
    @Query('email') email: string,
    @Query('pageSize', new DefaultValuePipe(0)) pageSize: number,
    @Query('pageNumber', new DefaultValuePipe(1)) pageNumber: number,
  ) {
    if (
      role &&
      !Object.values(StaffRole).includes(role.toUpperCase() as StaffRole)
    ) {
      return sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Failed - Invalid role',
      });
    }

    const data = await this.staffService.getStaff(
      pageSize,
      pageNumber,
      id,
      role,
      name,
      email,
    );

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - GET Staff',
      pageSize: pageSize || 0,
      pageNumber: pageNumber || 1,
      totalRows: data.totalRows,
      data: data.list,
    });
  }

  @Post()
  async addStaff(@Res() res: Response, @Body() req: StaffPostDTO) {
    if (
      req.role &&
      !Object.values(StaffRole).includes(req.role.toUpperCase() as StaffRole)
    ) {
      return sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Failed - Invalid role',
      });
    }

    const data = await this.staffService.addStaff(req);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - POST Staff',
      data: { id: data.identifiers[0].id },
    });
  }

  @Put()
  async updateStaff(@Res() res: Response, @Body() req: StaffPutDTO) {
    const data = await this.staffService.updateStaff(req);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - UPDATE Staff',
      data: { dataAffected: data.affected },
    });
  }

  @Delete()
  async deleteStaff(@Res() res: Response, @Query('id') id: number) {
    if (!id || isNaN(id)) {
      return sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Failed - Invalid ID',
      });
    }

    const data = await this.staffService.deleteStaff(id);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - DELETE Staff',
      data: { dataAffected: data.affected },
    });
  }
}
