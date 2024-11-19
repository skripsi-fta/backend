import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { RouterModule } from '@nestjs/core';
import { JanjiTemuModule } from './janjitemu/janjitemu.module';

@Module({
  imports: [
    AuthModule,
    JanjiTemuModule,
    RouterModule.register([
      {
        path: 'mobile/auth',
        module: AuthModule,
      },
      {
        path: 'mobile/janjitemu',
        module: JanjiTemuModule,
      },
    ]),
  ],
})
export class MobileModule {}
