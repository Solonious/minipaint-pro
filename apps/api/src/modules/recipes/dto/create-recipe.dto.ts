import { IsString, IsEnum, IsInt, IsArray, IsOptional, ValidateNested, Min, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { RecipeDifficulty } from '@prisma/client';

export class CreateRecipeStepDto {
  @ApiProperty({ example: 1, description: 'Step order (1-based)' })
  @IsInt()
  @Min(1)
  order: number;

  @ApiProperty({ example: 'Apply a thin base coat of Mephiston Red', description: 'Step instruction' })
  @IsString()
  instruction: string;

  @ApiPropertyOptional({ description: 'UUID of the paint used in this step' })
  @IsString()
  @IsOptional()
  paintId?: string;

  @ApiPropertyOptional({ example: 'layering', description: 'Painting technique (e.g., layering, drybrushing, wash)' })
  @IsString()
  @IsOptional()
  technique?: string;

  @ApiPropertyOptional({ description: 'URL to an image showing the step result' })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}

export class CreateRecipeDto {
  @ApiProperty({ example: 'Blood Angels Armor', description: 'Name of the recipe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Duncan Rhodes', description: 'Author name' })
  @IsString()
  authorName: string;

  @ApiProperty({ enum: RecipeDifficulty, example: RecipeDifficulty.INTERMEDIATE, description: 'Difficulty level' })
  @IsEnum(RecipeDifficulty)
  difficulty: RecipeDifficulty;

  @ApiProperty({ example: 45, description: 'Estimated time in minutes' })
  @IsInt()
  @Min(1)
  timeMinutes: number;

  @ApiProperty({ example: '#9A1115', description: 'Preview color hex (the final result color)' })
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'previewColorHex must be a valid hex color' })
  previewColorHex: string;

  @ApiPropertyOptional({ example: ['space marines', 'red', 'armor'], description: 'Tags for searching' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[] = [];

  @ApiProperty({ type: [CreateRecipeStepDto], description: 'Recipe steps in order' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRecipeStepDto)
  steps: CreateRecipeStepDto[];
}
