import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMiniatureDto } from './dto/create-miniature.dto';
import { UpdateMiniatureDto } from './dto/update-miniature.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { MoveModelsDto } from './dto/move-models.dto';
import { Miniature, MiniatureStatus, Prisma } from '@prisma/client';

// Interface for stage counts JSON field
interface StageCounts {
  unbuilt: number;
  assembled: number;
  primed: number;
  wip: number;
  painted: number;
  complete: number;
}

// Status order for computing minimum status
const STATUS_ORDER: MiniatureStatus[] = [
  MiniatureStatus.UNBUILT,
  MiniatureStatus.ASSEMBLED,
  MiniatureStatus.PRIMED,
  MiniatureStatus.WIP,
  MiniatureStatus.PAINTED,
  MiniatureStatus.COMPLETE,
];

// Map status enum to stageCounts key
function statusToKey(status: MiniatureStatus): keyof StageCounts {
  const map: Record<MiniatureStatus, keyof StageCounts> = {
    [MiniatureStatus.UNBUILT]: 'unbuilt',
    [MiniatureStatus.ASSEMBLED]: 'assembled',
    [MiniatureStatus.PRIMED]: 'primed',
    [MiniatureStatus.WIP]: 'wip',
    [MiniatureStatus.PAINTED]: 'painted',
    [MiniatureStatus.COMPLETE]: 'complete',
  };
  return map[status];
}

// Compute minimum status from stage counts
function computeMinimumStatus(stageCounts: StageCounts): MiniatureStatus {
  for (const status of STATUS_ORDER) {
    const key = statusToKey(status);
    if (stageCounts[key] > 0) {
      return status;
    }
  }
  return MiniatureStatus.UNBUILT;
}

// Create default stage counts for a new miniature
function createDefaultStageCounts(
  modelCount: number,
  status: MiniatureStatus = MiniatureStatus.UNBUILT
): StageCounts {
  const counts: StageCounts = {
    unbuilt: 0,
    assembled: 0,
    primed: 0,
    wip: 0,
    painted: 0,
    complete: 0,
  };
  counts[statusToKey(status)] = modelCount;
  return counts;
}

@Injectable()
export class MiniaturesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createMiniatureDto: CreateMiniatureDto): Promise<Miniature> {
    const modelCount = createMiniatureDto.modelCount ?? 1;
    const status = createMiniatureDto.status ?? MiniatureStatus.UNBUILT;

    // If stageCounts not provided, create default based on modelCount and status
    const stageCounts = createMiniatureDto.stageCounts
      ? createMiniatureDto.stageCounts
      : createDefaultStageCounts(modelCount, status);

    // Destructure to exclude stageCounts from the spread (will add it separately as JSON)
    const { stageCounts: _, ...restDto } = createMiniatureDto;

    return this.prisma.miniature.create({
      data: {
        ...restDto,
        userId,
        stageCounts: stageCounts as unknown as Prisma.JsonObject,
        tags: createMiniatureDto.tags ?? [],
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

    // Handle stageCounts separately as it's JSON
    const { stageCounts, ...restDto } = updateMiniatureDto;
    const data: Prisma.MiniatureUpdateInput = {
      ...restDto,
    };

    if (stageCounts !== undefined) {
      data.stageCounts = stageCounts as unknown as Prisma.JsonObject;
    }

    return this.prisma.miniature.update({
      where: { id },
      data,
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

    // Get current stage counts or create default
    const currentCounts = (miniature.stageCounts as unknown as StageCounts) ??
      createDefaultStageCounts(miniature.modelCount, miniature.status);

    // Find the first non-complete stage with models
    let sourceStage: MiniatureStatus | null = null;
    for (const status of STATUS_ORDER) {
      if (status === MiniatureStatus.COMPLETE) continue;
      const key = statusToKey(status);
      if (currentCounts[key] > 0) {
        sourceStage = status;
        break;
      }
    }

    if (!sourceStage) {
      // All models already complete
      return miniature;
    }

    // Move one model to complete
    const newCounts = { ...currentCounts };
    newCounts[statusToKey(sourceStage)] -= 1;
    newCounts.complete += 1;

    const newStatus = computeMinimumStatus(newCounts);
    const newCompleted = newCounts.complete;

    return this.prisma.miniature.update({
      where: { id },
      data: {
        stageCounts: newCounts,
        modelsCompleted: newCompleted,
        status: newStatus,
      },
    });
  }

  async decrementCompleted(userId: string, id: string): Promise<Miniature> {
    const miniature = await this.findOne(userId, id);

    // Get current stage counts or create default
    const currentCounts = (miniature.stageCounts as unknown as StageCounts) ??
      createDefaultStageCounts(miniature.modelCount, miniature.status);

    if (currentCounts.complete <= 0) {
      // No completed models to decrement
      return miniature;
    }

    // Move one model from complete to painted
    const newCounts = { ...currentCounts };
    newCounts.complete -= 1;
    newCounts.painted += 1;

    const newStatus = computeMinimumStatus(newCounts);
    const newCompleted = newCounts.complete;

    return this.prisma.miniature.update({
      where: { id },
      data: {
        stageCounts: newCounts,
        modelsCompleted: newCompleted,
        status: newStatus,
      },
    });
  }

  async moveModels(userId: string, id: string, moveModelsDto: MoveModelsDto): Promise<Miniature> {
    const miniature = await this.findOne(userId, id);

    // Get current stage counts or create default
    const currentCounts = (miniature.stageCounts as unknown as StageCounts) ??
      createDefaultStageCounts(miniature.modelCount, miniature.status);

    const fromKey = statusToKey(moveModelsDto.fromStage);
    const toKey = statusToKey(moveModelsDto.toStage);

    // Validate we have enough models in the source stage
    if (currentCounts[fromKey] < moveModelsDto.count) {
      throw new BadRequestException(
        `Not enough models in ${moveModelsDto.fromStage} stage. Have ${currentCounts[fromKey]}, tried to move ${moveModelsDto.count}`
      );
    }

    // Move models
    const newCounts = { ...currentCounts };
    newCounts[fromKey] -= moveModelsDto.count;
    newCounts[toKey] += moveModelsDto.count;

    // Compute new status and completed count
    const newStatus = computeMinimumStatus(newCounts);
    const newCompleted = newCounts.complete;

    return this.prisma.miniature.update({
      where: { id },
      data: {
        stageCounts: newCounts,
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
