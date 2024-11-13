import { IsNumber } from 'class-validator';

export class PharmacyUpdateDTO {
  @IsNumber()
  pharmacyFee: number;
  @IsNumber()
  appointmentId: number;
}
