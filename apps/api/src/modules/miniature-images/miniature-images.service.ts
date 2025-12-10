import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MiniatureImage, MiniatureImageType } from '@prisma/client';
import { CreateMiniatureImageDto, UpdateMiniatureImageDto } from './dto/create-miniature-image.dto';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class MiniatureImagesService {
  private readonly uploadDir = path.join(process.cwd(), 'apps/api/uploads/miniatures');

  constructor(private readonly prisma: PrismaService) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  private async verifyMiniatureOwnership(userId: string, miniatureId: string): Promise<void> {
    const miniature = await this.prisma.miniature.findFirst({
      where: { id: miniatureId, userId },
    });

    if (!miniature) {
      throw new NotFoundException(`Miniature with ID ${miniatureId} not found`);
    }
  }

  async uploadImage(
    userId: string,
    file: MulterFile,
    dto: CreateMiniatureImageDto
  ): Promise<MiniatureImage> {
    // Verify miniature belongs to user
    await this.verifyMiniatureOwnership(userId, dto.miniatureId);

    // Generate unique filename
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const filepath = path.join(this.uploadDir, filename);

    // Save file
    fs.writeFileSync(filepath, file.buffer);

    // Get current max order for this miniature
    const maxOrder = await this.prisma.miniatureImage.aggregate({
      where: { miniatureId: dto.miniatureId },
      _max: { order: true },
    });

    const order = dto.order ?? (maxOrder._max.order ?? -1) + 1;

    // Create record
    return this.prisma.miniatureImage.create({
      data: {
        miniatureId: dto.miniatureId,
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        caption: dto.caption,
        imageType: dto.imageType ?? MiniatureImageType.REFERENCE,
        order,
      },
    });
  }

  async findByMiniature(userId: string, miniatureId: string): Promise<MiniatureImage[]> {
    await this.verifyMiniatureOwnership(userId, miniatureId);

    return this.prisma.miniatureImage.findMany({
      where: { miniatureId },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(userId: string, id: string): Promise<MiniatureImage> {
    const image = await this.prisma.miniatureImage.findUnique({
      where: { id },
      include: { miniature: true },
    });

    if (!image || image.miniature.userId !== userId) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    return image;
  }

  async update(userId: string, id: string, dto: UpdateMiniatureImageDto): Promise<MiniatureImage> {
    await this.findOne(userId, id);

    return this.prisma.miniatureImage.update({
      where: { id },
      data: {
        ...(dto.caption !== undefined && { caption: dto.caption }),
        ...(dto.imageType !== undefined && { imageType: dto.imageType }),
        ...(dto.order !== undefined && { order: dto.order }),
      },
    });
  }

  async remove(userId: string, id: string): Promise<void> {
    const image = await this.findOne(userId, id);

    // Delete file
    const filepath = path.join(this.uploadDir, image.filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    // Delete record
    await this.prisma.miniatureImage.delete({
      where: { id },
    });
  }

  async reorder(userId: string, miniatureId: string, imageIds: string[]): Promise<MiniatureImage[]> {
    await this.verifyMiniatureOwnership(userId, miniatureId);

    // Update order for each image
    await Promise.all(
      imageIds.map((id, index) =>
        this.prisma.miniatureImage.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    return this.findByMiniature(userId, miniatureId);
  }

  getImageFilePath(filename: string): string {
    const filepath = path.join(this.uploadDir, filename);
    if (!fs.existsSync(filepath)) {
      throw new NotFoundException('Image file not found');
    }
    return filepath;
  }
}
