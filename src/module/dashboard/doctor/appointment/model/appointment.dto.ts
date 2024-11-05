import { IsJSON } from 'class-validator';
import type { UserDTO } from 'src/module/dashboard/auth/model/auth.dto';

export class CurrentAppointmentDTO {
  @IsJSON()
  user: UserDTO;
}
