import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GameSystem, ImageSource, UnitImage } from '@prisma/client';
import { ImportImageDto } from './dto/upload-image.dto';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as https from 'https';
import * as http from 'http';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class AdminService {
  private readonly uploadDir = path.join(process.cwd(), 'apps/api/uploads/units');

  constructor(private readonly prisma: PrismaService) {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadImage(
    file: MulterFile,
    gameSystem: GameSystem,
    faction: string,
    unitName: string
  ): Promise<UnitImage> {
    // Generate unique filename
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const filepath = path.join(this.uploadDir, filename);

    // Save file
    fs.writeFileSync(filepath, file.buffer);

    // Check if image already exists for this unit
    const existing = await this.prisma.unitImage.findUnique({
      where: {
        gameSystem_faction_unitName: {
          gameSystem,
          faction,
          unitName,
        },
      },
    });

    if (existing) {
      // Delete old file
      const oldFilepath = path.join(this.uploadDir, existing.filename);
      if (fs.existsSync(oldFilepath)) {
        fs.unlinkSync(oldFilepath);
      }

      // Update record
      return this.prisma.unitImage.update({
        where: { id: existing.id },
        data: {
          filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          source: ImageSource.MANUAL,
          sourceUrl: null,
        },
      });
    }

    // Create new record
    return this.prisma.unitImage.create({
      data: {
        gameSystem,
        faction,
        unitName,
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        source: ImageSource.MANUAL,
      },
    });
  }

  async importImage(dto: ImportImageDto): Promise<UnitImage> {
    // Download image from URL
    const imageBuffer = await this.downloadImage(dto.sourceUrl);

    // Determine file extension from URL or content type
    const urlPath = new URL(dto.sourceUrl).pathname;
    let ext = path.extname(urlPath) || '.jpg';
    if (!ext.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      ext = '.jpg';
    }

    const filename = `${uuidv4()}${ext}`;
    const filepath = path.join(this.uploadDir, filename);

    // Save file
    fs.writeFileSync(filepath, imageBuffer);

    // Check if image already exists for this unit
    const existing = await this.prisma.unitImage.findUnique({
      where: {
        gameSystem_faction_unitName: {
          gameSystem: dto.gameSystem,
          faction: dto.faction,
          unitName: dto.unitName,
        },
      },
    });

    const source = dto.source === 'WARHAMMER_COMMUNITY'
      ? ImageSource.WARHAMMER_COMMUNITY
      : dto.source === 'GAMES_WORKSHOP'
        ? ImageSource.GAMES_WORKSHOP
        : ImageSource.MANUAL;

    if (existing) {
      // Delete old file
      const oldFilepath = path.join(this.uploadDir, existing.filename);
      if (fs.existsSync(oldFilepath)) {
        fs.unlinkSync(oldFilepath);
      }

      // Update record
      return this.prisma.unitImage.update({
        where: { id: existing.id },
        data: {
          filename,
          originalName: path.basename(urlPath) || 'imported-image',
          mimeType: `image/${ext.replace('.', '')}`,
          size: imageBuffer.length,
          source,
          sourceUrl: dto.sourceUrl,
        },
      });
    }

    // Create new record
    return this.prisma.unitImage.create({
      data: {
        gameSystem: dto.gameSystem,
        faction: dto.faction,
        unitName: dto.unitName,
        filename,
        originalName: path.basename(urlPath) || 'imported-image',
        mimeType: `image/${ext.replace('.', '')}`,
        size: imageBuffer.length,
        source,
        sourceUrl: dto.sourceUrl,
      },
    });
  }

  private downloadImage(url: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;

      const request = protocol.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MiniPaint Pro/1.0)',
        }
      }, (response) => {
        // Handle redirects
        if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          this.downloadImage(response.headers.location).then(resolve).catch(reject);
          return;
        }

        if (response.statusCode !== 200) {
          reject(new BadRequestException(`Failed to download image: HTTP ${response.statusCode}`));
          return;
        }

        const chunks: Buffer[] = [];
        response.on('data', (chunk: Buffer) => chunks.push(chunk));
        response.on('end', () => resolve(Buffer.concat(chunks)));
        response.on('error', reject);
      });

      request.on('error', reject);
      request.setTimeout(30000, () => {
        request.destroy();
        reject(new BadRequestException('Image download timed out'));
      });
    });
  }

  async getAllImages(
    gameSystem?: GameSystem,
    faction?: string
  ): Promise<UnitImage[]> {
    return this.prisma.unitImage.findMany({
      where: {
        ...(gameSystem && { gameSystem }),
        ...(faction && { faction }),
      },
      orderBy: [
        { gameSystem: 'asc' },
        { faction: 'asc' },
        { unitName: 'asc' },
      ],
    });
  }

  async getImageByUnit(
    gameSystem: GameSystem,
    faction: string,
    unitName: string
  ): Promise<UnitImage | null> {
    return this.prisma.unitImage.findUnique({
      where: {
        gameSystem_faction_unitName: {
          gameSystem,
          faction,
          unitName,
        },
      },
    });
  }

  async getImageById(id: string): Promise<UnitImage> {
    const image = await this.prisma.unitImage.findUnique({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    return image;
  }

  async deleteImage(id: string): Promise<void> {
    const image = await this.getImageById(id);

    // Delete file
    const filepath = path.join(this.uploadDir, image.filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    // Delete record
    await this.prisma.unitImage.delete({
      where: { id },
    });
  }

  async getImageStats(): Promise<{
    totalImages: number;
    byGameSystem: Record<string, number>;
    bySource: Record<string, number>;
  }> {
    const images = await this.prisma.unitImage.findMany();

    const byGameSystem: Record<string, number> = {};
    const bySource: Record<string, number> = {};

    for (const img of images) {
      byGameSystem[img.gameSystem] = (byGameSystem[img.gameSystem] || 0) + 1;
      bySource[img.source] = (bySource[img.source] || 0) + 1;
    }

    return {
      totalImages: images.length,
      byGameSystem,
      bySource,
    };
  }

  getImageFilePath(filename: string): string {
    const filepath = path.join(this.uploadDir, filename);
    if (!fs.existsSync(filepath)) {
      throw new NotFoundException('Image file not found');
    }
    return filepath;
  }
}
