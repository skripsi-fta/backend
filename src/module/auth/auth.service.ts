import { Inject, Injectable } from '@nestjs/common';
import { AuthDTO } from './model/auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from 'src/database/entities/staff.entity';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import refreshJwtConfig from './config/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) {}

  async validateUser(req: AuthDTO) {
    const findUser = await this.staffRepository.findOneBy({
      username: req.username,
    });

    if (!findUser) {
      return null;
    }

    const { password, created_at, updated_at, ...user } = findUser;

    if (password !== req.password) {
      return null;
    }

    return user;
    // return this.jwtService.sign(user);
  }

  async login(req: Request) {
    console.log('req.user: ', req.user);
    const token = this.jwtService.sign(req.user);
    console.log(this.refreshTokenConfig);
    const refreshToken = this.jwtService.sign(
      req.user,
      this.refreshTokenConfig,
    );

    return {
      token,
      refreshToken,
    };
  }

  async refreshToken(req: Request) {
    console.log('req.user: ', req.user);
    const token = this.jwtService.sign(req.user);

    return {
      token,
    };
  }
}
