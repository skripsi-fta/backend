import { Module } from '@nestjs/common';
import { StaffModule } from './staff/staff.module';
import { RoomModule } from './room/room.module';
import { PatientModule } from './patient/patient.module';
import { SpecializationModule } from './specialization/specialization.module';
import { ScheduleManagementModule } from './schedule/schedule.module';
import { DoctorManagementModule } from './doctor/doctor.module';

@Module({
  imports: [
    StaffModule,
    DoctorManagementModule,
    RoomModule,
    PatientModule,
    SpecializationModule,
    ScheduleManagementModule,
  ],
})
export class ManagementModule {}
