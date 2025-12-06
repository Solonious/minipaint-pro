import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSectionPaintDto {
  @ApiProperty({ description: 'Paint ID' })
  @IsString()
  @IsNotEmpty()
  paintId: string;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ description: 'Technique (e.g., Base coat, Layer, Wash)' })
  @IsOptional()
  @IsString()
  technique?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateColorSchemeSectionDto {
  @ApiProperty({ description: 'Area name (e.g., Armor, Cloak, Weapon)' })
  @IsString()
  @IsNotEmpty()
  areaName: string;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiProperty({ type: [CreateSectionPaintDto], description: 'Paints for this section' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSectionPaintDto)
  paints: CreateSectionPaintDto[];
}

export class CreateColorSchemeDto {
  @ApiProperty({ description: 'Miniature ID' })
  @IsString()
  @IsNotEmpty()
  miniatureId: string;

  @ApiProperty({ description: 'Scheme name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: [CreateColorSchemeSectionDto], description: 'Sections' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateColorSchemeSectionDto)
  sections: CreateColorSchemeSectionDto[];
}

export class UpdateColorSchemeDto {
  @ApiPropertyOptional({ description: 'Scheme name' })
  @IsOptional()
  @IsString()
  name?: string;
}

export class UpdateColorSchemeSectionDto {
  @ApiPropertyOptional({ description: 'Area name' })
  @IsOptional()
  @IsString()
  areaName?: string;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsNumber()
  order?: number;
}

export class UpdateSectionPaintDto {
  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ description: 'Technique' })
  @IsOptional()
  @IsString()
  technique?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AddSectionDto {
  @ApiProperty({ description: 'Area name' })
  @IsString()
  @IsNotEmpty()
  areaName: string;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ type: [CreateSectionPaintDto], description: 'Paints' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSectionPaintDto)
  paints?: CreateSectionPaintDto[];
}

export class AddSectionPaintDto {
  @ApiProperty({ description: 'Paint ID' })
  @IsString()
  @IsNotEmpty()
  paintId: string;

  @ApiPropertyOptional({ description: 'Technique' })
  @IsOptional()
  @IsString()
  technique?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
