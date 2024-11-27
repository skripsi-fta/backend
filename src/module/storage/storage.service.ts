import { DownloadResponse, Storage } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';
import { StatusCodes } from 'http-status-codes';
import { ResponseError } from 'src/utils/api.utils';

@Injectable()
export class StorageService {
  private storage: Storage;
  private bucket: string;

  constructor() {
    const keyFileContent = JSON.parse(process.env.GCS_CREDENTIALS);

    this.storage = new Storage({
      credentials: keyFileContent,
      projectId: process.env.PROJECT_ID,
    });

    this.bucket = process.env.GCS_STORAGE_MEDIA_BUCKET;
  }

  async upload(file: Express.Multer.File) {
    const bucket = this.storage.bucket(this.bucket);
    const sanitizedFileName = file.originalname.replace(/ /g, '-');
    const fileName = `Photo/${Date.now()}-${sanitizedFileName}`;
    const blob = bucket.file(fileName);

    try {
      await blob.save(file.buffer, {
        resumable: false,
        contentType: file.mimetype,
      });

      return blob.name;
    } catch (error) {
      throw new ResponseError(
        'Images error to stored',
        StatusCodes.BAD_REQUEST,
      );
    }
  }

  async delete(path: string) {
    await this.storage
      .bucket(this.bucket)
      .file(path)
      .delete({ ignoreNotFound: true });
  }

  async get(path: string): Promise<Buffer> {
    try {
      const fileResponse: DownloadResponse = await this.storage
        .bucket(this.bucket)
        .file(path)
        .download();

      const [buffer] = fileResponse;
      return buffer;
    } catch (error) {
      throw new ResponseError('Images not found', StatusCodes.NOT_FOUND);
    }
  }
}
