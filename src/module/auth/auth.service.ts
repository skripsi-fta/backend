import { Inject, Injectable } from '@nestjs/common';
import { AuthDTO, type UserDTO } from './model/auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from 'src/database/entities/staff.entity';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import refreshJwtConfig from './config/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';
import { comparePassword } from 'src/utils/bcrypt.utils';

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
      ...(req.username.includes('@')
        ? { email: req.username }
        : { username: req.username }),
    });

    if (!findUser) {
      return null;
    }

    const matchedPassword = await comparePassword(
      req.password,
      findUser.password,
    );

    if (!matchedPassword) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, createdAt, updatedAt, ...user } = findUser;

    return user;
  }

  async login(req: Request) {
    const token = this.jwtService.sign(req.user);

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
    const user = req.user as UserDTO;

    const token = this.jwtService.sign(user);

    return {
      token,
    };
  }
}
