import { IsString, IsInt, IsOptional, IsEnum, Min } from 'class-validator';
import { GameSystem } from '@prisma/client';

export class CreateArmyDto {
  @IsString()
  name: string;

  @IsString()
  faction: string;

  @IsEnum(GameSystem)
  @IsOptional()
  gameSystem?: GameSystem = GameSystem.WARHAMMER_40K;

  @IsInt()
  @Min(0)
  targetPoints: number;

  @IsString()
  @IsOptional()
  iconEmoji?: string;

  @IsString()
  @IsOptional()
  colorHex?: string;
}
