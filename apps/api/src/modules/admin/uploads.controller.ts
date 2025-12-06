import { Controller, Get, Param, Res, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { AdminService } from './admin.service';
import { GameSystem } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('uploads')
@Controller('uploads')
@Public()
export class UploadsController {
  private readonly uploadDir = path.join(process.cwd(), 'apps/api/uploads/units');

  constructor(private readonly adminService: AdminService) {}

  @Get('units/:filename')
  @ApiOperation({ summary: 'Serve an uploaded image file' })
  async serveImage(@Param('filename') filename: string, @Res() res: Response) {
    const filepath = path.join(this.uploadDir, filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ message: 'Image not found' });
    }

    return res.sendFile(filepath);
  }
}

@ApiTags('unit-images')
@Controller('unit-images')
@Public()
export class UnitImagesController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'Get unit image URL by unit details' })
  @ApiQuery({ name: 'gameSystem', required: true, enum: GameSystem })
  @ApiQuery({ name: 'faction', required: true })
  @ApiQuery({ name: 'unitName', required: true })
  async getUnitImage(
    @Query('gameSystem') gameSystem: GameSystem,
    @Query('faction') faction: string,
    @Query('unitName') unitName: string
  ) {
    const image = await this.adminService.getImageByUnit(gameSystem, faction, unitName);

    if (!image) {
      return { imageUrl: null };
    }

    return {
      imageUrl: `/api/uploads/units/${image.filename}`,
      source: image.source,
    };
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all available unit images' })
  @ApiQuery({ name: 'gameSystem', required: false, enum: GameSystem })
  @ApiQuery({ name: 'faction', required: false })
  async getAllUnitImages(
    @Query('gameSystem') gameSystem?: GameSystem,
    @Query('faction') faction?: string
  ) {
    const images = await this.adminService.getAllImages(gameSystem, faction);

    return images.map((img) => ({
      gameSystem: img.gameSystem,
      faction: img.faction,
      unitName: img.unitName,
      imageUrl: `/api/uploads/units/${img.filename}`,
      source: img.source,
    }));
  }
}
