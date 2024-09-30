import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from 'src/database/entities/staff.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStartegy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import jwtConfig from './config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import refreshJwtConfig from './config/refresh-jwt.config';
import { RefreshJwtStrategy } from './strategies/refresh.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
    TypeOrmModule.forFeature([Staff]),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStartegy, JwtStrategy, RefreshJwtStrategy],
})
export class AuthModule {}
