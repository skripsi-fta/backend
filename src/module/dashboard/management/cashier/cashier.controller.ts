import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { CashierService } from './cashier.service';
import { sendResponse } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';
import { Response } from 'express';
import { UpdateCashierDTO } from './model/cashier.dto';

@Controller('')
export class CashierController {
  constructor(private cashierService: CashierService) {}

  @Get('')
  async getListCashierQueue(
    @Res() res: Response,
    @Query('pageSize', new DefaultValuePipe(0)) pageSize: number,
    @Query('pageNumber', new DefaultValuePipe(1)) pageNumber: number,
  ) {
    const data = await this.cashierService.getCashierQueue(
      pageSize,
      pageNumber,
    );
    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - Get Cashier Queue',
      pageSize: Number() || 0,
      pageNumber: Number() || 1,
      data: data.list,
      totalRows: data.totalRows,
    });
  }

  @Get('detail')
  async getTotalCashierQueue(@Res() res: Response) {
    const data = await this.cashierService.getTotalCashierQueue();
    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - Get Total Cashier Queue',
      data,
    });
  }

  @Put('update')
  async updateCashierQueue(
    @Res() res: Response,
    @Body() req: UpdateCashierDTO,
  ) {
    const data = await this.cashierService.updateCashierQueue(req);
    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - Update Cashier Queue',
      data,
    });
  }
}
