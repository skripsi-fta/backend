import { IsNumberString } from 'class-validator';

export class CreateAppointmentDTO {
  @IsNumberString()
  scheduleId: number;
}
