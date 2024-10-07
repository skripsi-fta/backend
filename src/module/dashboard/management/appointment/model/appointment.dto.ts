import { IsNumber } from 'class-validator';

export class AppointmentPostDTO {
  @IsNumber()
  patientId: number;

  @IsNumber()
  scheduleId: number;
}

export class AppointmentPutDTO {
  @IsNumber()
  id: number;

  @IsNumber()
  scheduleId: number;

  @IsNumber()
  medicalRecordId: number;
}
