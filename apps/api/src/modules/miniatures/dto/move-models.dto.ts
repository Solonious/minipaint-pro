import { IsInt, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MiniatureStatus } from '@prisma/client';

export class MoveModelsDto {
  @ApiProperty({
    enum: MiniatureStatus,
    description: 'Stage to move models from',
  })
  @IsEnum(MiniatureStatus)
  fromStage: MiniatureStatus;

  @ApiProperty({
    enum: MiniatureStatus,
    description: 'Stage to move models to',
  })
  @IsEnum(MiniatureStatus)
  toStage: MiniatureStatus;

  @ApiProperty({
    example: 1,
    description: 'Number of models to move',
    minimum: 1,
    maximum: 100,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  count: number;
}
