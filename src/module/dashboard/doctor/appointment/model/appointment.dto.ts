import { IsArray, IsJSON, IsNumber, IsString } from 'class-validator';
import type { UserDTO } from 'src/module/dashboard/auth/model/auth.dto';

export class CurrentAppointmentDTO {
  @IsJSON()
  user: UserDTO;
}

export class CheckAppointmentDTO {
  @IsString()
  diagnosis: string;

  @IsArray()
  resepDokter: string[];

  @IsString()
  notes: string;

  @IsNumber()
  appointmentId: number;
}
