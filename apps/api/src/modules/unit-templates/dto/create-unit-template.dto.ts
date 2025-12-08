import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsEnum } from 'class-validator';
import { GameSystem } from '@prisma/client';

export class CreateUnitTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  faction: string;

  @IsEnum(GameSystem)
  gameSystem: GameSystem;

  @IsOptional()
  @IsInt()
  @Min(0)
  defaultPoints?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  defaultModelCount?: number;

  @IsOptional()
  @IsString()
  wahapediaUnitId?: string;

  @IsOptional()
  @IsString()
  wahapediaUrl?: string;
}
