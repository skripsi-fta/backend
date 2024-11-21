import { IsEnum, IsString } from 'class-validator';
import { IdType } from 'src/database/entities/patient.entity';

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
