import { IsNumberString } from 'class-validator';

export class CreateAppointmentDTO {
  @IsNumberString()
  scheduleId: number;
}

export class PostRatingApppointmentDTO {
  @IsNumberString()
  appointmentId: number;

  @IsNumberString()
  rating: number;
}
