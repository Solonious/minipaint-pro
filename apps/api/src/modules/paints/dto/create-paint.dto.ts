import { IsString, IsEnum, IsBoolean, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaintBrand, PaintType } from '@prisma/client';

export class CreatePaintDto {
  @ApiProperty({ example: 'Custom Red', description: 'Name of the paint' })
  @IsString()
  name: string;

  @ApiProperty({ enum: PaintBrand, example: PaintBrand.CITADEL, description: 'Paint brand' })
  @IsEnum(PaintBrand)
  brand: PaintBrand;

  @ApiProperty({ enum: PaintType, example: PaintType.BASE, description: 'Type of paint' })
  @IsEnum(PaintType)
  type: PaintType;

  @ApiProperty({ example: '#9A1115', description: 'Hex color code (format: #RRGGBB)' })
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'colorHex must be a valid hex color' })
  colorHex: string;

  @ApiPropertyOptional({ default: false, description: 'Whether this is an official paint (false for custom paints)' })
  @IsBoolean()
  @IsOptional()
  isOfficial?: boolean = false;
}
