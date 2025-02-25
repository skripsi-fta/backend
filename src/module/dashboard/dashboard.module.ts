import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { RouterModule } from '@nestjs/core';
import { ManagementModule } from './management/management.module';
import { StaffModule } from './management/staff/staff.module';
import { RoomModule } from './management/room/room.module';
import { PatientModule } from './management/patient/patient.module';
import { SpecializationModule } from './management/specialization/specialization.module';
import { ScheduleManagementModule } from './management/schedule/schedule.module';
import { MedicalrecordModule } from './management/medicalrecord/medicalrecord.module';
import { AppointmentModule } from './management/appointment/appointment.module';
import { DoctorManagementModule } from './management/doctor/doctor.module';
import { DoctorModule } from './doctor/doctor.module';
import { ScheduleDoctorModule } from './doctor/schedule/schedule.module';
import { AppointmentDoctorModule } from './doctor/appointment/appointment.module';
import { PharmacyModule } from './pharmacy/pharmacy.module';
import { CashierModule } from './cashier/cashier.module';
import { LivequeueModule } from './livequeue/livequeue.module';
import { ReportManagementModule } from './management/report/report.module';

@Module({
  imports: [
    AuthModule,
    ManagementModule,
    DoctorModule,
    PharmacyModule,
    CashierModule,
    LivequeueModule,
    ReportManagementModule,
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
            module: DoctorManagementModule,
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
          {
            path: 'schedule',
            module: ScheduleManagementModule,
          },
          {
            path: 'medicalrecord',
            module: MedicalrecordModule,
          },
          {
            path: 'appointment',
            module: AppointmentModule,
          },
          {
            path: 'report',
            module: ReportManagementModule,
          },
        ],
      },
      {
        path: 'dashboard/doctor',
        module: DoctorModule,
        children: [
          {
            path: 'schedule',
            module: ScheduleDoctorModule,
          },
          {
            path: 'appointment',
            module: AppointmentDoctorModule,
          },
        ],
      },
      {
        path: 'dashboard/pharmacy/antrian',
        module: PharmacyModule,
      },
      {
        path: 'dashboard/cashier',
        module: CashierModule,
      },
      {
        path: 'dashboard/livequeue',
        module: LivequeueModule,
      },
    ]),
  ],
})
export class DashboardModule {}
