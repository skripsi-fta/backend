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
  UseGuards,
} from '@nestjs/common';
import { sendResponse } from 'src/utils/api.utils';
import { Response } from 'express';
import { DoctorService } from './doctor.service';
import { DoctorPostDTO, DoctorPutDTO } from './model/doctor.dto';
import { LoggerService } from 'src/module/logger/logger.service';
import { StaffRole } from 'src/database/entities/staff.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt.guards';
import { RoleGuard } from '../../auth/guards/role.guards';
import { Roles } from 'src/decorator/role.decorator';

@Controller('')
@Roles(StaffRole.MANAGEMENT)
@UseGuards(JwtAuthGuard, RoleGuard)
export class DoctorController {
  constructor(
    private log: LoggerService,
    private doctorService: DoctorService,
  ) {}

  @Get()
  async getDoctor(
    @Res() res: Response,
    @Query('id') id: number,
    @Query('name') name: string,
    @Query('rating') rating: boolean,
    @Query('totalRating') totalRating: boolean,
    @Query('consulePrice') consulePrice: boolean,
    @Query('pageSize', new DefaultValuePipe(0)) pageSize: number,
    @Query('pageNumber', new DefaultValuePipe(1)) pageNumber: number,
  ) {
    const data = await this.doctorService.getDoctor(
      id,
      name,
      rating,
      totalRating,
      consulePrice,
      pageSize,
      pageNumber,
    );

    return sendResponse(res, {
      statusCode: 200,
      message: 'Success - GET Doctor',
      pageSize: Number(pageSize) || 0,
      pageNumber: Number(pageSize) || 1,
      totalRows: data.totalRows,
      data: data.list,
    });
  }

  @Post()
  async postDoctor(@Res() res: Response, @Body() req: DoctorPostDTO) {
    const data = await this.doctorService.addDoctor(req);

    if (!data) {
      return sendResponse(res, {
        statusCode: 400,
        message: 'Failed - POST Doctor',
      });
    }

    return sendResponse(res, {
      statusCode: 200,
      message: 'Success - POST Doctor',
      data: data,
    });
  }

  @Put()
  async updateDoctor(@Res() res: Response, @Body() req: DoctorPutDTO) {
    const data = await this.doctorService.updateDoctor(req);

    if (!data) {
      return sendResponse(res, {
        statusCode: 400,
        message: 'Failed - PUT Doctor',
      });
    }

    return sendResponse(res, {
      statusCode: 200,
      message: 'Success - PUT Doctor',
      data: data,
    });
  }

  @Delete()
  async deleteDoctor(@Res() res: Response, @Query('id') id: number) {
    const data = await this.doctorService.deleteDoctor(id);

    if (!data) {
      return sendResponse(res, {
        statusCode: 400,
        message: 'Failed - DELETE Doctor',
      });
    }

    return sendResponse(res, {
      statusCode: 200,
      message: 'Success - DELETE Doctor',
      data: { dataAffected: data.affected },
    });
  }
}
