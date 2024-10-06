import { IsNumber } from 'class-validator';

export class AppointmentPostDTO {
  @IsNumber()
  patientId: number;

  @IsNumber()
  scheduleId: number;

  @IsNumber()
  medicalRecordId: number;
}
