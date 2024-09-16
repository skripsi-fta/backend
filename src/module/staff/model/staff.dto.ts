import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { StaffRole } from 'src/database/entities/staff.entity';

export class StaffPostDTO {
  @IsString()
  username: string;

  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsEnum(StaffRole)
  role: string;

  @IsOptional()
  doctorId: string | undefined;
}

export class StaffPutDTO {
  @IsNumber()
  id: number;

  @IsString()
  @IsOptional()
  username: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  password: string;

  @IsEnum(StaffRole)
  @IsOptional()
  role: string;

  @IsOptional()
  doctorId: string | undefined;
}
