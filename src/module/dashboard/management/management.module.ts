import { Module } from '@nestjs/common';
import { StaffModule } from './staff/staff.module';
import { RoomModule } from './room/room.module';
import { PatientModule } from './patient/patient.module';
import { SpecializationModule } from './specialization/specialization.module';
import { ScheduleManagementModule } from './schedule/schedule.module';
import { MedicalrecordModule } from './medicalrecord/medicalrecord.module';
import { AppointmentModule } from './appointment/appointment.module';
import { DoctorManagementModule } from './doctor/doctor.module';
import { CashierModule } from './cashier/cashier.module';

@Module({
  imports: [
    StaffModule,
    DoctorManagementModule,
    RoomModule,
    PatientModule,
    SpecializationModule,
    ScheduleManagementModule,
    MedicalrecordModule,
    AppointmentModule,
    CashierModule,
  ],
})
export class ManagementModule {}
