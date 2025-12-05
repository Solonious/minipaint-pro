import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMiniatureDto } from './dto/create-miniature.dto';
import { UpdateMiniatureDto } from './dto/update-miniature.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Miniature, MiniatureStatus } from '@prisma/client';

@Injectable()
export class MiniaturesService {
  constructor(private prisma: PrismaService) {}

  async create(createMiniatureDto: CreateMiniatureDto): Promise<Miniature> {
    return this.prisma.miniature.create({
      data: createMiniatureDto,
    });
  }

  async findAll(filters?: {
    status?: MiniatureStatus;
    armyId?: string;
    faction?: string;
  }): Promise<Miniature[]> {
    return this.prisma.miniature.findMany({
      where: {
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

  async findOne(id: string): Promise<Miniature> {
    const miniature = await this.prisma.miniature.findUnique({
      where: { id },
      include: {
        army: true,
      },
    });

    if (!miniature) {
      throw new NotFoundException(`Miniature with ID ${id} not found`);
    }

    return miniature;
  }

  async update(id: string, updateMiniatureDto: UpdateMiniatureDto): Promise<Miniature> {
    await this.findOne(id);

    return this.prisma.miniature.update({
      where: { id },
      data: updateMiniatureDto,
    });
  }

  async updateStatus(id: string, updateStatusDto: UpdateStatusDto): Promise<Miniature> {
    await this.findOne(id);

    return this.prisma.miniature.update({
      where: { id },
      data: { status: updateStatusDto.status },
    });
  }

  async remove(id: string): Promise<Miniature> {
    await this.findOne(id);

    return this.prisma.miniature.delete({
      where: { id },
    });
  }

  async getStatsByStatus(): Promise<Record<MiniatureStatus, number>> {
    const counts = await this.prisma.miniature.groupBy({
      by: ['status'],
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
}
