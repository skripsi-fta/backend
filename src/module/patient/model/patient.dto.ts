import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Gender, IdType } from 'src/database/entities/patient.entity';

export class PatientPostDTO {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  address: string;

  @IsDateString()
  dateOfBirth: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsEnum(IdType)
  idType: IdType;

  @IsString()
  idNumber: string;

  // TODO: enable if upload completed
  //   @IsString()
  //   idPhoto: string;
}

export class PatientPutDTO {
  @IsNumber()
  id: number;

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

  // TODO: enable if upload completed
  //   @IsString()
  //   idPhoto: string;
}
