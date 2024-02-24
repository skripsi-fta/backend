import { IsString } from 'class-validator';

export class HealthCheckPostDTO {
  @IsString()
  message: string;
}
