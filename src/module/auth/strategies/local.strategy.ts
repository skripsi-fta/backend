import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class LocalStartegy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {
    super();
  }

  async validate(username: string, password: string) {
    const user = await this.authService.validateUser({ username, password });

    if (!user) {
      throw new UnauthorizedException('Failed - Invalid username or password');
      //   throw new ResponseError(
      //     'Failed - Invalid username or password',
      //     StatusCodes.UNAUTHORIZED,
      //   );
    }

    return {
      jwtToken: this.jwtService.sign(user),
      user,
    };
  }
}
