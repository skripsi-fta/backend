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
import { RoomService } from './room.service';
import { sendResponse } from 'src/utils/api.utils';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { RoomPostDTO, RoomPutDTO } from './model/room.dto';
import { LoggerService } from 'src/module/logger/logger.service';
import { RoleGuard } from '../../auth/guards/role.guards';
import { JwtAuthGuard } from '../../auth/guards/jwt.guards';
import { Roles } from 'src/decorator/role.decorator';
import { StaffRole } from 'src/database/entities/staff.entity';

@Controller('')
@Roles(StaffRole.MANAGEMENT)
@UseGuards(JwtAuthGuard, RoleGuard)
export class RoomController {
  constructor(
    private log: LoggerService,
    private readonly roomService: RoomService,
  ) {}

  @Get()
  async getRoom(
    @Res() res: Response,
    @Query('id') id: number,
    @Query('name') name: string,
    @Query('pageSize', new DefaultValuePipe(0)) pageSize: number,
    @Query('pageNumber', new DefaultValuePipe(1)) pageNumber: number,
  ) {
    const data = await this.roomService.getRoom(id, name, pageSize, pageNumber);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - GET Room',
      pageSize: Number(pageSize) || 0,
      pageNumber: Number(pageNumber) || 1,
      totalRows: data.totalRows,
      data: data.list,
    });
  }

  @Post()
  async addRoom(@Res() res: Response, @Body() req: RoomPostDTO) {
    const data = await this.roomService.addRoom(req);
    return sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: 'Success - Add Room',
      data: data,
    });
  }

  @Put()
  async updateRoom(@Res() res: Response, @Body() req: RoomPutDTO) {
    const data = await this.roomService.updateRoom(req);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - Update Room',
      data: data,
    });
  }

  @Delete()
  async deleteRoom(@Res() res: Response, @Query('id') id: number) {
    const data = await this.roomService.deleteRoom(id);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - Delete Room',
      data: { dataAffected: data.affected },
    });
  }
}
