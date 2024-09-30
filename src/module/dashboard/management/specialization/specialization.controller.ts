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
import { SpecializationService } from './specialization.service';
import { sendResponse } from 'src/utils/api.utils';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  SpecializationPostDTO,
  SpecializationSwitchDTO,
  SpecializationUpdateDTO,
} from './model/specialization.dto';
import { LoggerService } from 'src/module/logger/logger.service';
import { RoleGuard } from '../../auth/guards/role.guards';
import { JwtAuthGuard } from '../../auth/guards/jwt.guards';
import { Roles } from 'src/decorator/role.decorator';
import { StaffRole } from 'src/database/entities/staff.entity';

@Controller('')
@Roles(StaffRole.MANAGEMENT)
@UseGuards(JwtAuthGuard, RoleGuard)
export class SpecializationController {
  constructor(
    private log: LoggerService,
    private specializationService: SpecializationService,
  ) {}

  @Get()
  async getSpecialization(
    @Res() res: Response,
    @Query('id') id: number,
    @Query('name') name: string,
    @Query('description') description: string,
    @Query('pageSize', new DefaultValuePipe(0)) pageSize: number,
    @Query('pageNumber', new DefaultValuePipe(1)) pageNumber: number,
  ) {
    const data = await this.specializationService.getSpecialization(
      pageSize,
      pageNumber,
      id,
      name,
      description,
    );

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - GET Specialization',
      pageSize: Number(pageSize) || 0,
      pageNumber: Number(pageNumber) || 1,
      totalRows: data.totalRows,
      data: data.list,
    });
  }

  @Post()
  async addSpecialization(
    @Res() res: Response,
    @Body() req: SpecializationPostDTO,
  ) {
    const data = await this.specializationService.createSpecialization(req);

    return sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: 'Success - Add Specialization',
      data: data,
    });
  }

  @Put('/switch')
  async switchSpecialization(
    @Res() res: Response,
    @Body() req: SpecializationSwitchDTO,
  ) {
    const data = await this.specializationService.switchSpecialization(req);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - Switch Specialization',
      data: data,
    });
  }

  @Put()
  async updateSpecialization(
    @Res() res: Response,
    @Body() body: SpecializationUpdateDTO,
  ) {
    const data = await this.specializationService.updateSpecialization(body);

    if (!data) {
      return sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Failed - PUT Specialization',
      });
    }

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - PUT Specialization',
      data: data,
    });
  }
}
