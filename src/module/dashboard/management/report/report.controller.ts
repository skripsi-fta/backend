import {
  Controller,
  DefaultValuePipe,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { StaffRole } from 'src/database/entities/staff.entity';
import { Roles } from 'src/decorator/role.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt.guards';
import { RoleGuard } from '../../auth/guards/role.guards';
import { ReportManagementService } from './report.service';
import type { Response } from 'express';
import { sendResponse } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';

@Controller('')
@Roles(StaffRole.MANAGEMENT)
@UseGuards(JwtAuthGuard, RoleGuard)
export class ReportManagementController {
  constructor(private reportService: ReportManagementService) {}

  @Get('pharmacy')
  async getPharmacyReport(
    @Res() res: Response,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('year') year: string,
    @Query('month') month: string,
    @Query('type') type: string,
  ) {
    const data = await this.reportService.getPharmacyReport({
      endDate,
      startDate,
      year,
      month,
      type,
    });

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - Get Report Pharmacy',
      data,
    });
  }

  @Get('pharmacy/data')
  async getPharmacyReportList(
    @Res() res: Response,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('year') year: string,
    @Query('month') month: string,
    @Query('type') type: string,
    @Query('pageSize', new DefaultValuePipe(5)) pageSize: number,
    @Query('pageNumber', new DefaultValuePipe(1)) pageNumber: number,
  ) {
    const data = await this.reportService.getPharmacyReportList({
      endDate,
      startDate,
      year,
      month,
      type,
      pageSize,
      pageNumber,
    });

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - Get List Report Pharmacy',
      data,
    });
  }

  @Get('cashier')
  async getCashierReport(
    @Res() res: Response,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('year') year: string,
    @Query('month') month: string,
    @Query('type') type: string,
  ) {
    const data = await this.reportService.getCashierReport({
      endDate,
      startDate,
      year,
      month,
      type,
    });

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - Get Report Cashier',
      data,
    });
  }

  @Get('cashier/data')
  async getCashierReportList(
    @Res() res: Response,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('year') year: string,
    @Query('month') month: string,
    @Query('type') type: string,
    @Query('pageSize', new DefaultValuePipe(5)) pageSize: number,
    @Query('pageNumber', new DefaultValuePipe(1)) pageNumber: number,
  ) {
    const data = await this.reportService.getCashierReportList({
      endDate,
      startDate,
      year,
      month,
      type,
      pageSize,
      pageNumber,
    });

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - Get List Report Cashier',
      data,
    });
  }

  @Get('doctor')
  async getDoctorReport(
    @Res() res: Response,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('year') year: string,
    @Query('month') month: string,
    @Query('type') type: string,
  ) {
    const data = await this.reportService.getDoctorReport({
      endDate,
      startDate,
      year,
      month,
      type,
    });

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - Get Report Doctor',
      data,
    });
  }

  @Get('doctor/data')
  async getDoctorReportList(
    @Res() res: Response,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('year') year: string,
    @Query('month') month: string,
    @Query('type') type: string,
    @Query('pageSize', new DefaultValuePipe(5)) pageSize: number,
    @Query('pageNumber', new DefaultValuePipe(1)) pageNumber: number,
  ) {
    const data = await this.reportService.getDoctorReportList({
      endDate,
      startDate,
      year,
      month,
      type,
      pageSize,
      pageNumber,
    });

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - Get List Report Doctor',
      data,
    });
  }
}
