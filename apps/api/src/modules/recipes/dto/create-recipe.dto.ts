import { IsString, IsEnum, IsInt, IsArray, IsOptional, ValidateNested, Min, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { RecipeDifficulty } from '@prisma/client';

export class CreateRecipeStepDto {
  @IsInt()
  @Min(1)
  order: number;

  @IsString()
  instruction: string;

  @IsString()
  @IsOptional()
  paintId?: string;

  @IsString()
  @IsOptional()
  technique?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}

export class CreateRecipeDto {
  @IsString()
  name: string;

  @IsString()
  authorName: string;

  @IsEnum(RecipeDifficulty)
  difficulty: RecipeDifficulty;

  @IsInt()
  @Min(1)
  timeMinutes: number;

  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'previewColorHex must be a valid hex color' })
  previewColorHex: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[] = [];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRecipeStepDto)
  steps: CreateRecipeStepDto[];
}
