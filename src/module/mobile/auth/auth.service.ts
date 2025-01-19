import { Inject, Injectable } from '@nestjs/common';
import { AuthDTO, RegisterDTO, UserDTO } from './model/auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import refreshJwtConfig from './config/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';
import { comparePassword, encodePassword } from 'src/utils/bcrypt.utils';
import { Auth } from 'src/database/entities/auth.entitity';
import { ResponseError } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) {}

  async validateUser(req: AuthDTO) {
    const findUser = await this.authRepository.findOne({
      where: {
        ...(req.username.includes('@')
          ? { email: req.username }
          : { phoneNumber: req.username }),
      },
      relations: {
        patient: true,
      },
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

  async registerUser(body: RegisterDTO) {
    const userExist = await this.authRepository.findOne({
      where: {
        ...(body.credentials.includes('@')
          ? { email: body.credentials }
          : { phoneNumber: body.credentials }),
      },
    });

    if (userExist) {
      throw new ResponseError(
        'Email atau nomor telepon sudah terpakai!',
        StatusCodes.CONFLICT,
      );
    }

    const newUser = this.authRepository.create({
      ...(body.credentials.includes('@')
        ? { email: body.credentials }
        : { phoneNumber: body.credentials }),
    });

    newUser.password = await encodePassword(body.password);

    await this.authRepository.insert(newUser);

    return newUser;
  }
}
