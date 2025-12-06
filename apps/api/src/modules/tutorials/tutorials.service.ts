import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MiniatureTutorial, VideoPlatform } from '@prisma/client';
import { CreateTutorialDto, UpdateTutorialDto } from './dto/create-tutorial.dto';

@Injectable()
export class TutorialsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTutorialDto): Promise<MiniatureTutorial> {
    // Verify miniature exists
    const miniature = await this.prisma.miniature.findUnique({
      where: { id: dto.miniatureId },
    });

    if (!miniature) {
      throw new NotFoundException(`Miniature with ID ${dto.miniatureId} not found`);
    }

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

  async findByMiniature(miniatureId: string): Promise<MiniatureTutorial[]> {
    return this.prisma.miniatureTutorial.findMany({
      where: { miniatureId },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string): Promise<MiniatureTutorial> {
    const tutorial = await this.prisma.miniatureTutorial.findUnique({
      where: { id },
    });

    if (!tutorial) {
      throw new NotFoundException(`Tutorial with ID ${id} not found`);
    }

    return tutorial;
  }

  async update(id: string, dto: UpdateTutorialDto): Promise<MiniatureTutorial> {
    await this.findOne(id);

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

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    await this.prisma.miniatureTutorial.delete({
      where: { id },
    });
  }

  async reorder(miniatureId: string, tutorialIds: string[]): Promise<MiniatureTutorial[]> {
    await Promise.all(
      tutorialIds.map((id, index) =>
        this.prisma.miniatureTutorial.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    return this.findByMiniature(miniatureId);
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
