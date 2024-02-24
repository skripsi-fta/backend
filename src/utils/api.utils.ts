import { StatusCodes } from 'http-status-codes';
import type { Response } from 'express';

export const ACCESS_TOKEN_COOKIE = 'accessToken';
export const REFRESH_TOKEN_COOKIE = 'refreshToken';

export interface APIResponse {
  statusCode?: StatusCodes;
  success?: boolean;
  message: string;
  data?: unknown;
}

export function sendResponse(res: Response, params: APIResponse) {
  const { statusCode, success, ...newParams } = params;

  const isSuccess = success ?? true;
  const code = statusCode ?? StatusCodes.OK;

  const response = {
    status: isSuccess ? 'success' : 'fail',
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
      success: false,
      message: error.message,
    };
  }
}
