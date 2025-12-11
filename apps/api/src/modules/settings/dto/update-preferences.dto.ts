import { IsEnum, IsOptional, IsInt, IsBoolean, IsString, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { GameSystem, PaintBrand } from '@prisma/client';

export enum ViewMode {
  GRID = 'GRID',
  LIST = 'LIST',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class UpdatePreferencesDto {
  @ApiPropertyOptional({ enum: GameSystem, description: 'Default game system for new miniatures' })
  @IsOptional()
  @IsEnum(GameSystem)
  defaultGameSystem?: GameSystem;

  @ApiPropertyOptional({ enum: PaintBrand, description: 'Default paint brand filter' })
  @IsOptional()
  @IsEnum(PaintBrand)
  defaultPaintBrand?: PaintBrand;

  @ApiPropertyOptional({ description: 'Items per page for lists', minimum: 10, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(100)
  itemsPerPage?: number;

  @ApiPropertyOptional({ enum: ViewMode, description: 'Default view mode for lists' })
  @IsOptional()
  @IsEnum(ViewMode)
  defaultViewMode?: ViewMode;

  @ApiPropertyOptional({ description: 'Show completed miniatures in pile' })
  @IsOptional()
  @IsBoolean()
  showCompletedMinis?: boolean;

  @ApiPropertyOptional({ description: 'Default sort field' })
  @IsOptional()
  @IsString()
  defaultSortField?: string;

  @ApiPropertyOptional({ enum: SortOrder, description: 'Default sort order' })
  @IsOptional()
  @IsEnum(SortOrder)
  defaultSortOrder?: SortOrder;

  @ApiPropertyOptional({ description: 'Enable email notifications' })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Enable streak reminder notifications' })
  @IsOptional()
  @IsBoolean()
  streakReminders?: boolean;
}
