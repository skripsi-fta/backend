import { Module } from '@nestjs/common';
import { ScheduleDoctorModule } from './schedule/schedule.module';

@Module({
  imports: [ScheduleDoctorModule],
})
export class DoctorModule {}
