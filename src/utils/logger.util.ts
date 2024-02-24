import 'winston-daily-rotate-file';

import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import { DateTime } from 'luxon';
import 'winston-daily-rotate-file';
import * as winston from 'winston';
import config from 'src/config';

function customPrintFormat() {
  return winston.format.printf(
    ({ level, message, timestamp }) => `[${timestamp}] ${level}: ${message}`,
  );
}

const customTimestampFormat = winston.format((info) => {
  const loggerDateFormat = 'yyyy-MM-dd - HH:mm:ss ZZ';
  const currDate = DateTime.now();

  info.timestamp = currDate.toFormat(loggerDateFormat);

  return info;
});

const loggerData = {
  level: config().isDev ? 'debug' : 'info',
  format: customTimestampFormat(),
  transports: [
    new winston.transports.DailyRotateFile({
      dirname: './logs',
      filename: '%DATE%.log',
      format: customPrintFormat(),
      maxSize: '5m',
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        nestWinstonModuleUtilities.format.nestLike('BACKEND', {
          colors: true,
          prettyPrint: true,
        }),
      ),
    }),
  ],
};

const logger = winston.createLogger(loggerData);

export { logger, loggerData };
