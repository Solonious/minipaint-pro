import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMiniatureDto } from './dto/create-miniature.dto';
import { UpdateMiniatureDto } from './dto/update-miniature.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Miniature, MiniatureStatus } from '@prisma/client';

@Injectable()
export class MiniaturesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createMiniatureDto: CreateMiniatureDto): Promise<Miniature> {
    return this.prisma.miniature.create({
      data: {
        ...createMiniatureDto,
        userId,
      },
    });
  }

  async findAll(userId: string, filters?: {
    status?: MiniatureStatus;
    armyId?: string;
    faction?: string;
  }): Promise<Miniature[]> {
    return this.prisma.miniature.findMany({
      where: {
        userId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.armyId && { armyId: filters.armyId }),
        ...(filters?.faction && { faction: filters.faction }),
      },
      include: {
        army: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findOne(userId: string, id: string): Promise<Miniature> {
    const miniature = await this.prisma.miniature.findFirst({
      where: { id, userId },
      include: {
        army: true,
      },
    });

    if (!miniature) {
      throw new NotFoundException(`Miniature with ID ${id} not found`);
    }

    return miniature;
  }

  async update(userId: string, id: string, updateMiniatureDto: UpdateMiniatureDto): Promise<Miniature> {
    await this.findOne(userId, id);

    return this.prisma.miniature.update({
      where: { id },
      data: updateMiniatureDto,
    });
  }

  async updateStatus(userId: string, id: string, updateStatusDto: UpdateStatusDto): Promise<Miniature> {
    await this.findOne(userId, id);

    return this.prisma.miniature.update({
      where: { id },
      data: { status: updateStatusDto.status },
    });
  }

  async remove(userId: string, id: string): Promise<Miniature> {
    await this.findOne(userId, id);

    return this.prisma.miniature.delete({
      where: { id },
    });
  }

  async getStatsByStatus(userId: string): Promise<Record<MiniatureStatus, number>> {
    const counts = await this.prisma.miniature.groupBy({
      by: ['status'],
      where: { userId },
      _count: true,
    });

    const stats = Object.values(MiniatureStatus).reduce(
      (acc, status) => ({ ...acc, [status]: 0 }),
      {} as Record<MiniatureStatus, number>
    );

    counts.forEach((count) => {
      stats[count.status] = count._count;
    });

    return stats;
  }

  async incrementCompleted(userId: string, id: string): Promise<Miniature> {
    const miniature = await this.findOne(userId, id);

    // Don't exceed modelCount
    const newCompleted = Math.min(miniature.modelsCompleted + 1, miniature.modelCount);

    // Auto-update status if all models are complete
    const newStatus = newCompleted === miniature.modelCount
      ? MiniatureStatus.COMPLETE
      : miniature.status;

    return this.prisma.miniature.update({
      where: { id },
      data: {
        modelsCompleted: newCompleted,
        status: newStatus,
      },
    });
  }

  async decrementCompleted(userId: string, id: string): Promise<Miniature> {
    const miniature = await this.findOne(userId, id);

    // Don't go below 0
    const newCompleted = Math.max(miniature.modelsCompleted - 1, 0);

    // If status was COMPLETE and we decrement, change to PAINTED
    const newStatus = miniature.status === MiniatureStatus.COMPLETE && newCompleted < miniature.modelCount
      ? MiniatureStatus.PAINTED
      : miniature.status;

    return this.prisma.miniature.update({
      where: { id },
      data: {
        modelsCompleted: newCompleted,
        status: newStatus,
      },
    });
  }

  async findOneWithLibrary(userId: string, id: string) {
    const miniature = await this.prisma.miniature.findFirst({
      where: { id, userId },
      include: {
        army: true,
        images: {
          orderBy: { order: 'asc' },
        },
        colorScheme: {
          include: {
            sections: {
              orderBy: { order: 'asc' },
              include: {
                paints: {
                  orderBy: { order: 'asc' },
                  include: {
                    paint: {
                      select: {
                        id: true,
                        name: true,
                        colorHex: true,
                        brand: true,
                        type: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        tutorials: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!miniature) {
      throw new NotFoundException(`Miniature with ID ${id} not found`);
    }

    return miniature;
  }
}
