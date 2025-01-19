import { IsNumber, IsNumberString, IsString } from 'class-validator';

export class MedicalRecordPostDTO {
  @IsNumber()
  appointmentId: number;

  @IsNumber()
  patientId: number;

  @IsNumberString()
  height: number;

  @IsNumberString()
  weight: number;

  @IsNumberString()
  systolic: number;

  @IsNumberString()
  diastolic: number;

  @IsNumberString()
  temperature: number;

  @IsString()
  illness: string;
}

export class MedicalRecordPutDTO {
  @IsNumber()
  id: number;

  @IsNumberString()
  height: number;

  @IsNumberString()
  weight: number;

  @IsNumberString()
  systolic: number;

  @IsNumberString()
  diastolic: number;

  @IsNumberString()
  temperature: number;

  @IsString()
  illness: string;
}
