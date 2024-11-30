import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  FileTypeValidator,
  Get,
  ParseFilePipe,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
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
import { FileInterceptor } from '@nestjs/platform-express';

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
  @UseInterceptors(FileInterceptor('image'))
  async postDoctor(
    @Res() res: Response,
    @Body() req: DoctorPostDTO,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // new MaxFileSizeValidator({ maxSize: 1000 }),
          new FileTypeValidator({ fileType: 'image/*' }),
        ],
      }),
    )
    image: Express.Multer.File,
  ) {
    const data = await this.doctorService.addDoctor(req, image);

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
  @UseInterceptors(FileInterceptor('image'))
  async updateDoctor(
    @Res() res: Response,
    @Body() req: DoctorPutDTO,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // new MaxFileSizeValidator({ maxSize: 1000 }),
          new FileTypeValidator({ fileType: 'image/*' }),
        ],
        fileIsRequired: false,
      }),
    )
    image: Express.Multer.File,
  ) {
    const data = await this.doctorService.updateDoctor(req, image);

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
