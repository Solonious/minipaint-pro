import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ColorScheme, ColorSchemeSection, SectionPaint } from '@prisma/client';
import {
  CreateColorSchemeDto,
  UpdateColorSchemeDto,
  AddSectionDto,
  UpdateColorSchemeSectionDto,
  AddSectionPaintDto,
  UpdateSectionPaintDto,
} from './dto/create-color-scheme.dto';

type ColorSchemeWithRelations = ColorScheme & {
  sections: (ColorSchemeSection & {
    paints: (SectionPaint & { paint: { id: string; name: string; colorHex: string; brand: string; type: string } })[];
  })[];
};

@Injectable()
export class ColorSchemesService {
  constructor(private readonly prisma: PrismaService) {}

  private async verifyMiniatureOwnership(userId: string, miniatureId: string): Promise<void> {
    const miniature = await this.prisma.miniature.findFirst({
      where: { id: miniatureId, userId },
    });

    if (!miniature) {
      throw new NotFoundException(`Miniature with ID ${miniatureId} not found`);
    }
  }

  private async verifySchemeOwnership(userId: string, schemeId: string): Promise<void> {
    const scheme = await this.prisma.colorScheme.findUnique({
      where: { id: schemeId },
      include: { miniature: true },
    });

    if (!scheme || scheme.miniature.userId !== userId) {
      throw new NotFoundException(`Color scheme with ID ${schemeId} not found`);
    }
  }

  async create(userId: string, dto: CreateColorSchemeDto): Promise<ColorSchemeWithRelations> {
    // Verify miniature belongs to user
    await this.verifyMiniatureOwnership(userId, dto.miniatureId);

    // Check if scheme already exists for this miniature
    const existing = await this.prisma.colorScheme.findUnique({
      where: { miniatureId: dto.miniatureId },
    });

    if (existing) {
      throw new ConflictException(`Color scheme already exists for miniature ${dto.miniatureId}`);
    }

    // Create scheme with nested sections and paints
    return this.prisma.colorScheme.create({
      data: {
        miniatureId: dto.miniatureId,
        name: dto.name,
        sections: {
          create: dto.sections.map((section, sectionIndex) => ({
            areaName: section.areaName,
            order: section.order ?? sectionIndex,
            paints: {
              create: section.paints.map((paint, paintIndex) => ({
                paintId: paint.paintId,
                order: paint.order ?? paintIndex,
                technique: paint.technique,
                notes: paint.notes,
              })),
            },
          })),
        },
      },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: {
            paints: {
              orderBy: { order: 'asc' },
              include: {
                paint: {
                  select: { id: true, name: true, colorHex: true, brand: true, type: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async findByMiniature(userId: string, miniatureId: string): Promise<ColorSchemeWithRelations | null> {
    await this.verifyMiniatureOwnership(userId, miniatureId);

    return this.prisma.colorScheme.findUnique({
      where: { miniatureId },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: {
            paints: {
              orderBy: { order: 'asc' },
              include: {
                paint: {
                  select: { id: true, name: true, colorHex: true, brand: true, type: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async findOne(userId: string, id: string): Promise<ColorSchemeWithRelations> {
    const scheme = await this.prisma.colorScheme.findUnique({
      where: { id },
      include: {
        miniature: true,
        sections: {
          orderBy: { order: 'asc' },
          include: {
            paints: {
              orderBy: { order: 'asc' },
              include: {
                paint: {
                  select: { id: true, name: true, colorHex: true, brand: true, type: true },
                },
              },
            },
          },
        },
      },
    });

    if (!scheme || scheme.miniature.userId !== userId) {
      throw new NotFoundException(`Color scheme with ID ${id} not found`);
    }

    return scheme;
  }

  async update(userId: string, id: string, dto: UpdateColorSchemeDto): Promise<ColorSchemeWithRelations> {
    await this.findOne(userId, id);

    return this.prisma.colorScheme.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
      },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: {
            paints: {
              orderBy: { order: 'asc' },
              include: {
                paint: {
                  select: { id: true, name: true, colorHex: true, brand: true, type: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.findOne(userId, id);

    await this.prisma.colorScheme.delete({
      where: { id },
    });
  }

  // Section operations
  async addSection(userId: string, schemeId: string, dto: AddSectionDto): Promise<ColorSchemeSection> {
    await this.verifySchemeOwnership(userId, schemeId);

    const maxOrder = await this.prisma.colorSchemeSection.aggregate({
      where: { schemeId },
      _max: { order: true },
    });

    const order = dto.order ?? (maxOrder._max.order ?? -1) + 1;

    return this.prisma.colorSchemeSection.create({
      data: {
        schemeId,
        areaName: dto.areaName,
        order,
        paints: dto.paints
          ? {
              create: dto.paints.map((paint, index) => ({
                paintId: paint.paintId,
                order: paint.order ?? index,
                technique: paint.technique,
                notes: paint.notes,
              })),
            }
          : undefined,
      },
      include: {
        paints: {
          orderBy: { order: 'asc' },
          include: {
            paint: {
              select: { id: true, name: true, colorHex: true, brand: true, type: true },
            },
          },
        },
      },
    });
  }

  private async verifySectionOwnership(userId: string, sectionId: string): Promise<void> {
    const section = await this.prisma.colorSchemeSection.findUnique({
      where: { id: sectionId },
      include: { scheme: { include: { miniature: true } } },
    });

    if (!section || section.scheme.miniature.userId !== userId) {
      throw new NotFoundException(`Section with ID ${sectionId} not found`);
    }
  }

  private async verifySectionPaintOwnership(userId: string, paintId: string): Promise<void> {
    const paint = await this.prisma.sectionPaint.findUnique({
      where: { id: paintId },
      include: { section: { include: { scheme: { include: { miniature: true } } } } },
    });

    if (!paint || paint.section.scheme.miniature.userId !== userId) {
      throw new NotFoundException(`Section paint with ID ${paintId} not found`);
    }
  }

  async updateSection(userId: string, sectionId: string, dto: UpdateColorSchemeSectionDto): Promise<ColorSchemeSection> {
    await this.verifySectionOwnership(userId, sectionId);

    return this.prisma.colorSchemeSection.update({
      where: { id: sectionId },
      data: {
        ...(dto.areaName !== undefined && { areaName: dto.areaName }),
        ...(dto.order !== undefined && { order: dto.order }),
      },
      include: {
        paints: {
          orderBy: { order: 'asc' },
          include: {
            paint: {
              select: { id: true, name: true, colorHex: true, brand: true, type: true },
            },
          },
        },
      },
    });
  }

  async removeSection(userId: string, sectionId: string): Promise<void> {
    await this.verifySectionOwnership(userId, sectionId);

    await this.prisma.colorSchemeSection.delete({
      where: { id: sectionId },
    });
  }

  // Paint operations within sections
  async addPaintToSection(userId: string, sectionId: string, dto: AddSectionPaintDto): Promise<SectionPaint> {
    await this.verifySectionOwnership(userId, sectionId);

    const maxOrder = await this.prisma.sectionPaint.aggregate({
      where: { sectionId },
      _max: { order: true },
    });

    return this.prisma.sectionPaint.create({
      data: {
        sectionId,
        paintId: dto.paintId,
        order: (maxOrder._max.order ?? -1) + 1,
        technique: dto.technique,
        notes: dto.notes,
      },
      include: {
        paint: {
          select: { id: true, name: true, colorHex: true, brand: true, type: true },
        },
      },
    });
  }

  async updateSectionPaint(userId: string, paintId: string, dto: UpdateSectionPaintDto): Promise<SectionPaint> {
    await this.verifySectionPaintOwnership(userId, paintId);

    return this.prisma.sectionPaint.update({
      where: { id: paintId },
      data: {
        ...(dto.order !== undefined && { order: dto.order }),
        ...(dto.technique !== undefined && { technique: dto.technique }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      include: {
        paint: {
          select: { id: true, name: true, colorHex: true, brand: true, type: true },
        },
      },
    });
  }

  async removeSectionPaint(userId: string, paintId: string): Promise<void> {
    await this.verifySectionPaintOwnership(userId, paintId);

    await this.prisma.sectionPaint.delete({
      where: { id: paintId },
    });
  }
}
