import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalGuard } from './guards/local.guards';
import { Request } from 'express';
import { JwtAuthGuard } from './guards/jwt.guards';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalGuard)
  async login(@Req() req: Request) {
    console.log('req.user: ', req.user);
    return req.user;
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  async status(@Req() req: Request) {
    console.log('req.user: ', req.user);
    return req.user;
  }
}
