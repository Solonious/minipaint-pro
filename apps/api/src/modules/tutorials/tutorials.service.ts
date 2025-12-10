import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MiniatureTutorial, VideoPlatform } from '@prisma/client';
import { CreateTutorialDto, UpdateTutorialDto } from './dto/create-tutorial.dto';

@Injectable()
export class TutorialsService {
  constructor(private readonly prisma: PrismaService) {}

  private async verifyMiniatureOwnership(userId: string, miniatureId: string): Promise<void> {
    const miniature = await this.prisma.miniature.findFirst({
      where: { id: miniatureId, userId },
    });

    if (!miniature) {
      throw new NotFoundException(`Miniature with ID ${miniatureId} not found`);
    }
  }

  async create(userId: string, dto: CreateTutorialDto): Promise<MiniatureTutorial> {
    // Verify miniature belongs to user
    await this.verifyMiniatureOwnership(userId, dto.miniatureId);

    // Get current max order
    const maxOrder = await this.prisma.miniatureTutorial.aggregate({
      where: { miniatureId: dto.miniatureId },
      _max: { order: true },
    });

    const order = dto.order ?? (maxOrder._max.order ?? -1) + 1;

    // Detect platform from URL
    const platform = dto.platform ?? this.detectPlatform(dto.videoUrl);

    return this.prisma.miniatureTutorial.create({
      data: {
        miniatureId: dto.miniatureId,
        title: dto.title,
        videoUrl: dto.videoUrl,
        platform,
        duration: dto.duration,
        author: dto.author,
        order,
      },
    });
  }

  async findByMiniature(userId: string, miniatureId: string): Promise<MiniatureTutorial[]> {
    await this.verifyMiniatureOwnership(userId, miniatureId);

    return this.prisma.miniatureTutorial.findMany({
      where: { miniatureId },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(userId: string, id: string): Promise<MiniatureTutorial> {
    const tutorial = await this.prisma.miniatureTutorial.findUnique({
      where: { id },
      include: { miniature: true },
    });

    if (!tutorial || tutorial.miniature.userId !== userId) {
      throw new NotFoundException(`Tutorial with ID ${id} not found`);
    }

    return tutorial;
  }

  async update(userId: string, id: string, dto: UpdateTutorialDto): Promise<MiniatureTutorial> {
    await this.findOne(userId, id);

    // Detect platform if URL changed
    let platform = dto.platform;
    if (dto.videoUrl && !dto.platform) {
      platform = this.detectPlatform(dto.videoUrl);
    }

    return this.prisma.miniatureTutorial.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.videoUrl !== undefined && { videoUrl: dto.videoUrl }),
        ...(platform !== undefined && { platform }),
        ...(dto.duration !== undefined && { duration: dto.duration }),
        ...(dto.author !== undefined && { author: dto.author }),
        ...(dto.order !== undefined && { order: dto.order }),
      },
    });
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.findOne(userId, id);

    await this.prisma.miniatureTutorial.delete({
      where: { id },
    });
  }

  async reorder(userId: string, miniatureId: string, tutorialIds: string[]): Promise<MiniatureTutorial[]> {
    await this.verifyMiniatureOwnership(userId, miniatureId);

    await Promise.all(
      tutorialIds.map((id, index) =>
        this.prisma.miniatureTutorial.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    return this.findByMiniature(userId, miniatureId);
  }

  private detectPlatform(url: string): VideoPlatform {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return VideoPlatform.YOUTUBE;
    }
    if (url.includes('vimeo.com')) {
      return VideoPlatform.VIMEO;
    }
    return VideoPlatform.CUSTOM;
  }
}
