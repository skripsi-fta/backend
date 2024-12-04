import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { RouterModule } from '@nestjs/core';
import { PatientModule } from './patient/patient.module';
import { SpecializationModule } from './specialization/specialization.module';
import { DoctorModule } from './doctor/doctor.module';
import { ScheduleModule } from './schedule/schedule.module';
import { AppointmentModule } from './appointment/appointment.module';

@Module({
  imports: [
    AuthModule,
    PatientModule,
    SpecializationModule,
    DoctorModule,
    ScheduleModule,
    AppointmentModule,
    RouterModule.register([
      {
        path: 'mobile/auth',
        module: AuthModule,
      },
      { path: 'mobile/appointment', module: AppointmentModule },
      {
        path: 'mobile/patient',
        module: PatientModule,
      },
      { path: 'mobile/specialization', module: SpecializationModule },
      { path: 'mobile/doctor', module: DoctorModule },
      { path: 'mobile/schedule', module: ScheduleModule },
    ]),
  ],
})
export class MobileModule {}
