import { IsString } from 'class-validator';
import type { StaffRole } from 'src/database/entities/staff.entity';

export class AuthDTO {
  @IsString()
  username: string;

  @IsString()
  password: string;
}

export class UserDTO {
  id: number;
  phoneNumber: string;
  email: string;
  role: StaffRole;
}

export class RegisterDTO {
  @IsString()
  credentials: string;

  @IsString()
  password: string;
}
