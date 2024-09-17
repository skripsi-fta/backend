import {
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class DoctorPostDTO {
  @IsString()
  name: string;

  @IsString()
  profile: string;

  @IsNumberString()
  consulePrice: number;

  @IsNumber()
  specializationId: number;
}

export class DoctorPutDTO {
  @IsNumber()
  id: number;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  profile: string;

  @IsNumberString()
  @IsOptional()
  consulePrice: number;

  @IsNumber()
  specializationId: number;
}
