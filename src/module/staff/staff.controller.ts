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
import { StaffPostDTO } from './model/staff.dto';
import { StaffService } from './staff.service';
import { StatusCodes } from 'http-status-codes';

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
      !['DOCTOR', 'NURSE', 'PHARMACIST', 'RECEPTIONIST', 'ADMIN'].includes(
        role.toUpperCase(),
      )
    ) {
      return sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Invalid role',
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
      message: 'GET USER Success',
      totalRows: data.totalRows,
      data: data.list,
    });
  }

  @Post()
  async addStaff(@Res() res: Response, @Body() req: StaffPostDTO) {
    const data = await this.staffService.addStaff(req);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'POST USER Success',
      data: data.identifiers[0].id,
    });
  }

  @Put()
  async updateStaff(@Res() res: Response, @Body() req: StaffPostDTO) {
    const data = await this.staffService.updateStaff(req);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'PUT USER Success',
      data: data.affected,
    });
  }

  @Delete()
  async deleteStaff(@Res() res: Response, @Query('id') id: number) {
    const data = await this.staffService.deleteStaff(id);

    return sendResponse(res, {
      statusCode: 200,
      message: 'DELETE USER Success',
      data: data.affected,
    });
  }
}
