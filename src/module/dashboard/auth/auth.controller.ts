import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { LocalGuard } from './guards/local.guards';
import { Request } from 'express';
import { JwtAuthGuard } from './guards/jwt.guards';
import { AuthService } from './auth.service';
import { RefreshJwtGuard } from './guards/refresh-jwt.guards';

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
}
