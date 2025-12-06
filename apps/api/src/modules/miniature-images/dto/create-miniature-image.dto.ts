import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { MiniatureImageType } from '@prisma/client';

export class CreateMiniatureImageDto {
  @ApiProperty({ description: 'Miniature ID' })
  @IsString()
  @IsNotEmpty()
  miniatureId: string;

  @ApiPropertyOptional({ description: 'Image caption' })
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiPropertyOptional({ enum: MiniatureImageType, description: 'Image type' })
  @IsOptional()
  @IsEnum(MiniatureImageType)
  imageType?: MiniatureImageType;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsNumber()
  order?: number;
}

export class UpdateMiniatureImageDto {
  @ApiPropertyOptional({ description: 'Image caption' })
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiPropertyOptional({ enum: MiniatureImageType, description: 'Image type' })
  @IsOptional()
  @IsEnum(MiniatureImageType)
  imageType?: MiniatureImageType;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsNumber()
  order?: number;
}

export class ReorderImagesDto {
  @ApiProperty({ description: 'Miniature ID' })
  @IsString()
  @IsNotEmpty()
  miniatureId: string;

  @ApiProperty({ description: 'Array of image IDs in desired order', type: [String] })
  @IsString({ each: true })
  imageIds: string[];
}
