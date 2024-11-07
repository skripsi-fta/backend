import { Module } from '@nestjs/common';
import { ScheduleDoctorModule } from './schedule/schedule.module';
import { AppointmentDoctorModule } from './appointment/appointment.module';

@Module({
  imports: [ScheduleDoctorModule, AppointmentDoctorModule],
})
export class DoctorModule {}
