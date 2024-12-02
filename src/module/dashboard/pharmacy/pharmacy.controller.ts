import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { StaffRole } from 'src/database/entities/staff.entity';
import { Roles } from 'src/decorator/role.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guards';
import { RoleGuard } from '../auth/guards/role.guards';
import { LoggerService } from 'src/module/logger/logger.service';
import { PharmacyService } from './pharmacy.service';
import { Response } from 'express';
import { sendResponse } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';
import { PharmacyUpdateDTO } from './model/pharmacy.dto';
import { LiveQueueGateaway } from 'src/module/livequeue/livequeuegateaway';

@Controller('')
@Roles(StaffRole.MANAGEMENT, StaffRole.PHARMACIST)
@UseGuards(JwtAuthGuard, RoleGuard)
export class PharmacyController {
  constructor(
    private log: LoggerService,
    private pharmacyService: PharmacyService,
    private liveQueueGateaway: LiveQueueGateaway,
  ) {}

  @Get()
  async getDetailCurrentQueue(@Res() res: Response) {
    const result = await this.pharmacyService.getDetailCurrentQueue();

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - GET Detail Current Pharmacy Queue',
      data: result,
    });
  }

  @Get('list')
  async getPharmacyQueue(
    @Res() res: Response,
    @Query('pageSize', new DefaultValuePipe(0)) pageSize: number,
    @Query('pageNumber', new DefaultValuePipe(1)) pageNumber: number,
  ) {
    const data = await this.pharmacyService.getPharmacyQueue({
      pageNumber,
      pageSize,
    });

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - GET List Pharmacy',
      pageSize: Number(pageSize) || 0,
      pageNumber: Number(pageNumber) || 1,
      totalRows: data.totalRows,
      data: data.list,
    });
  }

  @Post()
  async updateQueue(@Res() res: Response, @Body() body: PharmacyUpdateDTO) {
    const data = await this.pharmacyService.updatePharmacyQueue(body);

    this.liveQueueGateaway.sendQueueData('queue', 'cashier');

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - POST Pharmacy Queue',
      data,
    });
  }
}
