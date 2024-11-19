import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LocalGuard } from './guards/local.guards';
import { Request, type Response } from 'express';
import { JwtAuthGuard } from './guards/jwt.guards';
import { AuthService } from './auth.service';
import { RefreshJwtGuard } from './guards/refresh-jwt.guards';
import type { RegisterDTO } from './model/auth.dto';
import { sendResponse } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';

@Controller('')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalGuard)
  async login(@Req() req: Request) {
    const login = await this.authService.login(req);

    return {
      token: login.token,
      refreshToken: login.refreshToken,
      user: req.user,
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async status(@Req() req: Request) {
    return req.user;
  }

  @Get('refresh')
  @UseGuards(RefreshJwtGuard)
  async refresh(@Req() req: Request) {
    return await this.authService.refreshToken(req);
  }

  @Post('register')
  async register(@Body() body: RegisterDTO, @Res() res: Response) {
    const newData = await this.authService.registerUser(body);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: 'Success - Register Patient',
      data: newData,
    });
  }
}
