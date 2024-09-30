import { IsNumber, IsString } from 'class-validator';

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
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  description: string;
}
