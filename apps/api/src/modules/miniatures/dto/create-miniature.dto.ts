import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  IsArray,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  MiniatureStatus,
  GameSystem,
  UnbuiltState,
  WipStage,
  MiniatureTag,
} from '@prisma/client';
import { Type, Transform } from 'class-transformer';

// DTO for stage counts
export class StageCountsDto {
  @IsInt()
  @Min(0)
  unbuilt: number = 0;

  @IsInt()
  @Min(0)
  assembled: number = 0;

  @IsInt()
  @Min(0)
  primed: number = 0;

  @IsInt()
  @Min(0)
  wip: number = 0;

  @IsInt()
  @Min(0)
  painted: number = 0;

  @IsInt()
  @Min(0)
  complete: number = 0;
}

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

  @ApiPropertyOptional({
    description: 'Stage counts for multi-model tracking',
    example: { unbuilt: 5, assembled: 0, primed: 0, wip: 0, painted: 0, complete: 0 },
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => StageCountsDto)
  stageCounts?: StageCountsDto;

  @ApiPropertyOptional({ enum: UnbuiltState, description: 'Substate for unbuilt models' })
  @IsEnum(UnbuiltState)
  @IsOptional()
  unbuiltState?: UnbuiltState;

  @ApiPropertyOptional({ enum: WipStage, description: 'Current WIP painting stage' })
  @IsEnum(WipStage)
  @IsOptional()
  wipStage?: WipStage;

  @ApiPropertyOptional({
    enum: MiniatureTag,
    isArray: true,
    description: 'Tags that apply to the miniature',
  })
  @IsArray()
  @IsEnum(MiniatureTag, { each: true })
  @IsOptional()
  tags?: MiniatureTag[] = [];

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
  @Transform(({ value }) => (value !== undefined && value !== null && value !== '' ? Number(value) : undefined))
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
