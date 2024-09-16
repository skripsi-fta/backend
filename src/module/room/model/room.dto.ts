import { IsNumber, IsOptional, IsString } from 'class-validator';

export class RoomPostDTO {
  @IsString()
  name: string;

  @IsString()
  detail: string;
}

export class RoomPutDTO {
  @IsNumber()
  id: number;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  detail: string;
}
