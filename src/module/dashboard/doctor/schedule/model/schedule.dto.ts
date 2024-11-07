import { IsNumber, IsString } from 'class-validator';

export class RequestChangeScheduleDTO {
  @IsNumber()
  scheduleId: number;

  @IsString()
  notes: string;

  @IsString()
  date: string;

  @IsNumber()
  capacity: number;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsNumber()
  doctorId: number;
}

export class FinishScheduleDTO {
  @IsNumber()
  scheduleId: number;
}
