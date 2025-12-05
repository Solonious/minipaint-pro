import { IsInt, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LogSessionDto {
  @ApiProperty({ example: 2, description: 'Number of models painted in this session' })
  @IsInt()
  @Min(1)
  modelsPainted: number;

  @ApiPropertyOptional({ example: 1.5, description: 'Hours spent painting' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  hoursPainted?: number;
}
