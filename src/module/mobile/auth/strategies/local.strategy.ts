import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStartegy extends PassportStrategy(Strategy, 'local-patient') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string) {
    const user = await this.authService.validateUser({ username, password });

    if (!user) {
      throw new UnauthorizedException(
        'Email atau nomor telepon atau password salah',
      );
    }

    return user;
  }
}
