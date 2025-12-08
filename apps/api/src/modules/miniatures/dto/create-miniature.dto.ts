import { IsString, IsInt, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MiniatureStatus, GameSystem } from '@prisma/client';

export class CreateMiniatureDto {
  @ApiProperty({ example: 'Intercessor Squad', description: 'Name of the miniature or unit' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Space Marines', description: 'Faction the miniature belongs to' })
  @IsString()
  faction: string;

  @ApiProperty({ example: 100, description: 'Points value for the miniature' })
  @IsInt()
  @Min(0)
  points: number;

  @ApiPropertyOptional({ example: 5, default: 1, description: 'Number of models in the unit' })
  @IsInt()
  @Min(1)
  @IsOptional()
  modelCount?: number = 1;

  @ApiPropertyOptional({ example: 0, default: 0, description: 'Number of models completed' })
  @IsInt()
  @Min(0)
  @IsOptional()
  modelsCompleted?: number = 0;

  @ApiPropertyOptional({ enum: MiniatureStatus, default: MiniatureStatus.UNBUILT, description: 'Current painting status' })
  @IsEnum(MiniatureStatus)
  @IsOptional()
  status?: MiniatureStatus = MiniatureStatus.UNBUILT;

  @ApiPropertyOptional({ enum: GameSystem, description: 'Game system (Warhammer 40K, Kill Team, etc.)' })
  @IsEnum(GameSystem)
  @IsOptional()
  gameSystem?: GameSystem;

  @ApiPropertyOptional({ description: 'UUID of the army this miniature belongs to' })
  @IsString()
  @IsOptional()
  armyId?: string;

  @ApiPropertyOptional({ description: 'Wahapedia unit ID' })
  @IsString()
  @IsOptional()
  unitId?: string;

  @ApiPropertyOptional({ description: 'Wahapedia URL for the unit datasheet' })
  @IsString()
  @IsOptional()
  wahapediaUrl?: string;

  @ApiPropertyOptional({ example: 45.00, description: 'Cost paid for the miniature' })
  @IsNumber()
  @IsOptional()
  cost?: number;

  @ApiPropertyOptional({ example: 'Need to magnetize weapons', description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'URL to an image of the miniature' })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}
