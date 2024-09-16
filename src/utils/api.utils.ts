import { StatusCodes } from 'http-status-codes';
import type { Response } from 'express';

export const ACCESS_TOKEN_COOKIE = 'accessToken';
export const REFRESH_TOKEN_COOKIE = 'refreshToken';

export interface APIResponse {
  statusCode?: StatusCodes;
  message: string;
  totalRows?: number;
  pageSize?: number;
  pageNumber?: number;
  data?: unknown;
}

export function sendResponse(res: Response, params: APIResponse) {
  const { statusCode, ...newParams } = params;

  const code = statusCode ?? StatusCodes.OK;

  const response = {
    statusCode: code,
    ...newParams,
  };

  return res.status(code).json(response);
}

export class ResponseError extends Error {
  statusCode: StatusCodes;

  constructor(message: string, statusCode?: StatusCodes) {
    super(message);

    this.name = ResponseError.name;
    this.statusCode = statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR;
  }

  static toResponse(error: ResponseError): APIResponse {
    return {
      statusCode: error.statusCode,
      message: error.message,
    };
  }
}
