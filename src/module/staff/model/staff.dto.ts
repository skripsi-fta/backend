import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class StaffPostDTO {
  @IsNumber()
  @IsOptional()
  id: number | undefined;

  @IsString()
  username: string;

  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsEnum(['DOCTOR', 'NURSE', 'PHARMACIST', 'RECEPTIONIST', 'ADMIN'])
  role: string;

  @IsOptional()
  doctorId: string | undefined;
}
