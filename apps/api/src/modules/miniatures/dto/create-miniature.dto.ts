import { IsString, IsInt, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { MiniatureStatus } from '@prisma/client';

export class CreateMiniatureDto {
  @IsString()
  name: string;

  @IsString()
  faction: string;

  @IsInt()
  @Min(0)
  points: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  modelCount?: number = 1;

  @IsEnum(MiniatureStatus)
  @IsOptional()
  status?: MiniatureStatus = MiniatureStatus.UNBUILT;

  @IsString()
  @IsOptional()
  armyId?: string;

  @IsNumber()
  @IsOptional()
  cost?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
