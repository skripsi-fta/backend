import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Schedule } from 'src/database/entities/schedule.entity';
import { LoggerService } from 'src/module/logger/logger.service';
import { Repository } from 'typeorm';

@Injectable()
export class ScheduleManagementService {
  constructor(
    private log: LoggerService,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}
}
