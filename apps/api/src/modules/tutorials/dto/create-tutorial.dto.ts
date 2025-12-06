import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { VideoPlatform } from '@prisma/client';

export class CreateTutorialDto {
  @ApiProperty({ description: 'Miniature ID' })
  @IsString()
  @IsNotEmpty()
  miniatureId: string;

  @ApiProperty({ description: 'Tutorial title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Video URL' })
  @IsString()
  @IsNotEmpty()
  videoUrl: string;

  @ApiPropertyOptional({ enum: VideoPlatform, description: 'Video platform' })
  @IsOptional()
  @IsEnum(VideoPlatform)
  platform?: VideoPlatform;

  @ApiPropertyOptional({ description: 'Video duration in seconds' })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({ description: 'Video author' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsNumber()
  order?: number;
}

export class UpdateTutorialDto {
  @ApiPropertyOptional({ description: 'Tutorial title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Video URL' })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({ enum: VideoPlatform, description: 'Video platform' })
  @IsOptional()
  @IsEnum(VideoPlatform)
  platform?: VideoPlatform;

  @ApiPropertyOptional({ description: 'Video duration in seconds' })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({ description: 'Video author' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsNumber()
  order?: number;
}

export class ReorderTutorialsDto {
  @ApiProperty({ description: 'Miniature ID' })
  @IsString()
  @IsNotEmpty()
  miniatureId: string;

  @ApiProperty({ description: 'Array of tutorial IDs in desired order', type: [String] })
  @IsString({ each: true })
  tutorialIds: string[];
}
