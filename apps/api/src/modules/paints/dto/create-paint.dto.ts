import { IsString, IsEnum, IsBoolean, IsOptional, Matches } from 'class-validator';
import { PaintBrand, PaintType } from '@prisma/client';

export class CreatePaintDto {
  @IsString()
  name: string;

  @IsEnum(PaintBrand)
  brand: PaintBrand;

  @IsEnum(PaintType)
  type: PaintType;

  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'colorHex must be a valid hex color' })
  colorHex: string;

  @IsBoolean()
  @IsOptional()
  isOfficial?: boolean = true;
}
