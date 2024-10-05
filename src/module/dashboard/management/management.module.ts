import { Module } from '@nestjs/common';
import { StaffModule } from './staff/staff.module';
import { DoctorModule } from './doctor/doctor.module';
import { RoomModule } from './room/room.module';
import { PatientModule } from './patient/patient.module';
import { SpecializationModule } from './specialization/specialization.module';
import { ScheduleManagementModule } from './schedule/schedule.module';

@Module({
  imports: [
    StaffModule,
    DoctorModule,
    RoomModule,
    PatientModule,
    SpecializationModule,
    ScheduleManagementModule,
  ],
})
export class ManagementModule {}
