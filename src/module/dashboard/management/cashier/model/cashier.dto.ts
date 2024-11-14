import { IsNumber } from 'class-validator';

export class UpdateCashierDTO {
  @IsNumber()
  bookingId: number;
}
