import { IsInt, IsOptional, IsNumber, Min } from 'class-validator';

export class LogSessionDto {
  @IsInt()
  @Min(1)
  modelsPainted: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  hoursPainted?: number;
}
