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
import { StaffRole } from 'src/database/entities/staff.entity';
import { Roles } from 'src/decorator/role.decorator';
import { RoleGuard } from '../../auth/guards/role.guards';
import { JwtAuthGuard } from '../../auth/guards/jwt.guards';
import { MedicalrecordService } from './medicalrecord.service';
import { sendResponse } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';
import { Response } from 'express';
import {
  MedicalRecordPostDTO,
  MedicalRecordPutDTO,
} from './model/medicalrecord.dto';

@Controller('')
@Roles(StaffRole.MANAGEMENT)
@UseGuards(JwtAuthGuard, RoleGuard)
export class MedicalrecordController {
  constructor(private medicalrecordService: MedicalrecordService) {}

  @Get()
  async getMedicalRecord(
    @Res() res: Response,
    @Query('id') id: number,
    @Query('patientId') patientId: number,
    @Query('pageSize', new DefaultValuePipe(0)) pageSize: number,
    @Query('pageNumber', new DefaultValuePipe(1)) pageNumber: number,
  ) {
    const data = await this.medicalrecordService.getMedicalRecord(
      pageSize,
      pageNumber,
      id,
      patientId,
    );

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - Get Medical Record',
      pageSize: Number(pageSize) || 0,
      pageNumber: Number(pageNumber) || 1,
      totalRows: data.totalRows,
      data: data.list,
    });
  }

  @Post()
  async addMedicalRecord(
    @Res() res: Response,
    @Body() req: MedicalRecordPostDTO,
  ) {
    const data = await this.medicalrecordService.addMedicalRecord(req);

    return sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: 'Success - Add Medical Record',
      data: data,
    });
  }

  @Put()
  async updateMedicalRecord(
    @Res() res: Response,
    @Body() req: MedicalRecordPutDTO,
  ) {
    const data = await this.medicalrecordService.updateMedicalRecord(req);

    return sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: 'Success - Update Medical Record',
      data: { dataAffected: data.affected },
    });
  }

  @Delete()
  async deleteMedicalRecord(@Res() res: Response, @Query('id') id: number) {
    const data = await this.medicalrecordService.deleteMedicalRecord(id);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - DELETE Medical Record',
      data: { dataAffected: data.affected },
    });
  }
}
