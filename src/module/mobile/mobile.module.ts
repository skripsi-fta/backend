import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { RouterModule } from '@nestjs/core';
import { JanjiTemuModule } from './janjitemu/janjitemu.module';
import { PatientModule } from './patient/patient.module';
import { SpecializationModule } from './specialization/specialization.module';

@Module({
  imports: [
    AuthModule,
    JanjiTemuModule,
    PatientModule,
    SpecializationModule,
    RouterModule.register([
      {
        path: 'mobile/auth',
        module: AuthModule,
      },
      {
        path: 'mobile/janjitemu',
        module: JanjiTemuModule,
      },
      {
        path: 'mobile/patient',
        module: PatientModule,
      },
      { path: 'mobile/specialization', module: SpecializationModule },
    ]),
  ],
})
export class MobileModule {}
