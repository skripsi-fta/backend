import { Controller, Get, UseGuards } from '@nestjs/common';
import { StaffRole } from 'src/database/entities/staff.entity';
import { Roles } from 'src/decorator/role.decorator';
import { RoleGuard } from '../../auth/guards/role.guards';
import { JwtAuthGuard } from '../../auth/guards/jwt.guards';
import { LoggerService } from 'src/module/logger/logger.service';

@Controller('')
@Roles(StaffRole.MANAGEMENT)
@UseGuards(JwtAuthGuard, RoleGuard)
export class ScheduleManagementController {
  constructor(private log: LoggerService) {}

  @Get('/fixed')
  async getFixedSchedule() {
    console.log('tes');
  }
}
