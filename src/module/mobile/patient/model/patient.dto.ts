import { IsDateString, IsEnum, IsString } from 'class-validator';
import { Gender, IdType } from 'src/database/entities/patient.entity';

export class CheckPatientDTO {
  @IsString()
  idNumber: string;

  @IsEnum(IdType)
  idType: string;
}

export class LinkPatientDTO {
  @IsString()
  idNumber: string;

  @IsEnum(IdType)
  idType: string;
}

export class CreatePatientDTO {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsDateString()
  dateOfBirth: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsEnum(IdType)
  idType: IdType;

  @IsString()
  idNumber: string;
}
