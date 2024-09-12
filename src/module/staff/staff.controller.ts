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
    @Query('pageSize', new DefaultValuePipe(0)) pageSize: number,
    @Query('pageNumber', new DefaultValuePipe(0)) pageNumber: number,
  ) {
    const data = await this.staffService.getStaff(pageSize, pageNumber, id);

    if (data.list.length == 0) {
      return sendResponse(res, {
        statusCode: StatusCodes.NOT_FOUND,
        success: false,
        message: 'NOT FOUND',
      });
    }

    return sendResponse(res, {
      statusCode: 200,
      message: 'GET USER',
      totalRows: data.totalRows,
      data: data.list,
    });
  }

  @Post()
  async addStaff(@Res() res: Response, @Body() req: StaffPostDTO) {
    const data = await this.staffService.addStaff(req);

    return sendResponse(res, {
      statusCode: 200,
      message: 'POST USER',
      data: data.identifiers[0].id,
    });
  }

  @Put()
  async updateStaff(@Res() res: Response, @Body() req: StaffPostDTO) {
    this.log.info('req:' + JSON.stringify(req));
    const data = await this.staffService.updateStaff(req);

    return sendResponse(res, {
      statusCode: 200,
      message: 'PUT USER',
      data: data.affected,
    });
  }

  @Delete()
  async deleteStaff(@Res() res: Response, @Query('id') id: number) {
    const data = await this.staffService.deleteStaff(id);

    return sendResponse(res, {
      statusCode: 200,
      message: 'DELETE USER',
      data: data.affected,
    });
  }
}
