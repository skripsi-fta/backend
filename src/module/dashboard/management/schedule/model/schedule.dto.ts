import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ScheduleDay } from 'src/database/entities/fixedschedule.entity';

export class FixedScheduleCreateDTO {
  @IsEnum(ScheduleDay)
  day: string;

  @IsNumber()
  doctorId: number;

  @IsNumber()
  roomId: number;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsNumber()
  capacity: number;
}

export class FixedScheduleUpdateDTO {
  @IsEnum(ScheduleDay)
  day: string;

  @IsNumber()
  id: number;

  @IsNumber()
  roomId: number;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsNumber()
  capacity: number;

  @IsBoolean()
  isOverrideSchedule: boolean;
}

export class FixedScheduleDeleteDTO {
  @IsNumber()
  id: number;

  @IsBoolean()
  deleteSchedule: boolean;
}

export class ScheduleCreateDTO {
  @IsString()
  date: string;

  @IsNumber()
  capacity: number;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsNumber()
  roomId: number;

  @IsNumber()
  doctorId: number;
}

export class ScheduleChangeDTO {
  @IsNumber()
  id: number;

  @IsString()
  date: string;

  @IsNumber()
  capacity: number;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsNumber()
  roomId: number;
}

export class ScheduleApprovalDTO {
  @IsNumber()
  id: number;

  @IsIn(['reject', 'approve', 'cancel'])
  action: string;

  @IsOptional()
  @IsNumber()
  roomId: number;
}
