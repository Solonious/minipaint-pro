import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GameSystem } from '@prisma/client';

export class UploadImageDto {
  @ApiProperty({ enum: GameSystem, description: 'Game system' })
  @IsEnum(GameSystem)
  @IsNotEmpty()
  gameSystem: GameSystem;

  @ApiProperty({ description: 'Faction name' })
  @IsString()
  @IsNotEmpty()
  faction: string;

  @ApiProperty({ description: 'Unit name (exact match)' })
  @IsString()
  @IsNotEmpty()
  unitName: string;
}

export class ImportImageDto {
  @ApiProperty({ enum: GameSystem, description: 'Game system' })
  @IsEnum(GameSystem)
  @IsNotEmpty()
  gameSystem: GameSystem;

  @ApiProperty({ description: 'Faction name' })
  @IsString()
  @IsNotEmpty()
  faction: string;

  @ApiProperty({ description: 'Unit name (exact match)' })
  @IsString()
  @IsNotEmpty()
  unitName: string;

  @ApiProperty({ description: 'Source URL to fetch image from' })
  @IsString()
  @IsNotEmpty()
  sourceUrl: string;

  @ApiPropertyOptional({ description: 'Image source type' })
  @IsOptional()
  @IsString()
  source?: 'WARHAMMER_COMMUNITY' | 'GAMES_WORKSHOP';
}
