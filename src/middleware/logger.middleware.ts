import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import type { NextFunction, Request, Response } from 'express';
import type { StreamOptions } from 'morgan';
import * as morgan from 'morgan';
import { Inject, Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logFormat: string;
  private readonly streamOption: StreamOptions;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.logFormat =
      '":method :url" :status - ' + ':response-time ms ":user-agent"';

    this.streamOption = {
      write(str) {
        logger.info(str.trim());
      },
    };
  }

  use(req: Request, res: Response, next: NextFunction) {
    const logging = morgan(this.logFormat, { stream: this.streamOption });
    return logging(req, res, next);
  }
}
