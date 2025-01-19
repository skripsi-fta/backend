import {
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class SpecializationPostDTO {
  @IsString()
  name: string;

  @IsString()
  description: string;
}

export class SpecializationSwitchDTO {
  @IsNumber()
  id: number;
}

export class SpecializationUpdateDTO {
  @IsNumberString()
  id: number;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  description: string;
}
