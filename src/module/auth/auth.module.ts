import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from 'src/database/entities/staff.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStartegy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      // secret: config().jwt.accessSecret,
      secret: 'secret123123',
      signOptions: { expiresIn: '10s' },
    }),
    TypeOrmModule.forFeature([Staff]),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStartegy, JwtStrategy],
})
export class AuthModule {}
