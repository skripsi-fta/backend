import { Controller, Get, UseGuards } from '@nestjs/common';
import { StaffRole } from 'src/database/entities/staff.entity';
import { Roles } from 'src/decorator/role.decorator';
import { RoleGuard } from '../../auth/guards/role.guards';
import { JwtAuthGuard } from '../../auth/guards/jwt.guards';
import { LoggerService } from 'src/module/logger/logger.service';
import { ScheduleDoctorService } from './schedule.service';

@Controller('')
@Roles(StaffRole.MANAGEMENT, StaffRole.DOCTOR)
@UseGuards(JwtAuthGuard, RoleGuard)
export class ScheduleDoctorController {
  constructor(
    private log: LoggerService,
    private scheduleService: ScheduleDoctorService,
  ) {}

  @Get()
  async test() {
    console.log('halo');
  }
}
