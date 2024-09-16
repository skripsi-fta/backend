import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { StaffRole } from 'src/database/entities/staff.entity';

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

  @IsEnum(StaffRole)
  role: string;

  @IsOptional()
  doctorId: string | undefined;
}
