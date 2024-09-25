import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { PatientService } from './patient.service';
import { sendResponse } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { PatientPostDTO, PatientPutDTO } from './model/patient.dto';

@Controller('patient')
export class PatientController {
  constructor(
    private log: LoggerService,
    private patientService: PatientService,
  ) {}

  @Get()
  async getPatient(
    @Res() res: Response,
    @Query('id') id: number,
    @Query('name') name: string,
    @Query('pageSize', new DefaultValuePipe(0)) pageSize: number,
    @Query('pageNumber', new DefaultValuePipe(1)) pageNumber: number,
  ) {
    const data = await this.patientService.getPatient(
      pageSize,
      pageNumber,
      id,
      name,
    );

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - Get Patient',
      pageSize: Number(pageSize) || 0,
      pageNumber: Number(pageNumber) || 1,
      totalRows: data.totalRows,
      data: data.list,
    });
  }

  @Post()
  async addPatient(@Res() res: Response, @Body() req: PatientPostDTO) {
    const data = await this.patientService.addPatient(req);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - Add Patient',
      data: data,
    });
  }

  @Put()
  async updatePatient(@Res() res: Response, @Body() req: PatientPutDTO) {
    const data = await this.patientService.updatePatient(req);

    if (!data) {
      return sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Failed - PUT Patient',
      });
    }

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - PUT Patient',
      data: data,
    });
  }

  @Delete()
  async deletePatient(@Res() res: Response, @Query('id') id: number) {
    const data = await this.patientService.deletePatient(id);

    if (!data) {
      return sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Failed - DELETE Patient',
      });
    }

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - DELETE Patient',
      data: { dataAffected: data.affected },
    });
  }
}
