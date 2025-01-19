import { IsString } from 'class-validator';

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
}

export class RegisterDTO {
  @IsString()
  credentials: string;

  @IsString()
  password: string;
}
