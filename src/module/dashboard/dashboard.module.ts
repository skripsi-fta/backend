import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { RouterModule } from '@nestjs/core';
import { ManagementModule } from './management/management.module';
import { StaffModule } from './management/staff/staff.module';
import { DoctorModule } from './management/doctor/doctor.module';
import { RoomModule } from './management/room/room.module';
import { PatientModule } from './management/patient/patient.module';
import { SpecializationModule } from './management/specialization/specialization.module';

@Module({
  imports: [
    AuthModule,
    ManagementModule,
    RouterModule.register([
      {
        path: 'dashboard/auth',
        module: AuthModule,
      },
      {
        path: 'dashboard/management',
        module: ManagementModule,
        children: [
          {
            path: 'staff',
            module: StaffModule,
          },
          {
            path: 'doctor',
            module: DoctorModule,
          },
          {
            path: 'room',
            module: RoomModule,
          },
          {
            path: 'patient',
            module: PatientModule,
          },
          {
            path: 'specialization',
            module: SpecializationModule,
          },
        ],
      },
    ]),
  ],
})
export class DashboardModule {}
