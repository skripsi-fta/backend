import {
  Controller,
  FileTypeValidator,
  Get,
  ParseFilePipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { ResponseError, sendImage, sendResponse } from 'src/utils/api.utils';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { StatusCodes } from 'http-status-codes';

@Controller('')
export class StorageController {
  constructor(private googleStorage: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Res() res: Response,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // new MaxFileSizeValidator({ maxSize: 1000 }),
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
      }),
    )
    image: Express.Multer.File,
  ) {
    if (!image) {
      throw new ResponseError('No file provided!', StatusCodes.BAD_REQUEST);
    }
    const filePath = await this.googleStorage.upload(image);

    return sendResponse(res, {
      statusCode: 200,
      message: 'Success - POST Doctor',
      data: filePath,
    });
  }

  @Get('')
  async getGcp(@Res() res: Response, @Query('path') path: string) {
    const data = await this.googleStorage.get(path);

    return sendImage(res, 'image/jpg', data);
  }
}
