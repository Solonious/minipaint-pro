import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateArmyDto } from './dto/create-army.dto';
import { UpdateArmyDto } from './dto/update-army.dto';
import { Army, MiniatureStatus } from '@prisma/client';

interface ArmyWithStats extends Army {
  stats: {
    totalMiniatures: number;
    totalModels: number;
    currentPoints: number;
    completedPoints: number;
    byStatus: Record<MiniatureStatus, number>;
  };
}

@Injectable()
export class ArmiesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createArmyDto: CreateArmyDto): Promise<Army> {
    return this.prisma.army.create({
      data: {
        ...createArmyDto,
        userId,
      },
    });
  }

  async findAll(userId: string): Promise<ArmyWithStats[]> {
    const armies = await this.prisma.army.findMany({
      where: { userId },
      include: {
        miniatures: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return armies.map((army) => this.calculateArmyStats(army));
  }

  async findOne(userId: string, id: string): Promise<ArmyWithStats> {
    const army = await this.prisma.army.findFirst({
      where: { id, userId },
      include: {
        miniatures: true,
      },
    });

    if (!army) {
      throw new NotFoundException(`Army with ID ${id} not found`);
    }

    return this.calculateArmyStats(army);
  }

  async update(userId: string, id: string, updateArmyDto: UpdateArmyDto): Promise<Army> {
    await this.findOne(userId, id);

    return this.prisma.army.update({
      where: { id },
      data: updateArmyDto,
    });
  }

  async remove(userId: string, id: string): Promise<Army> {
    await this.findOne(userId, id);

    return this.prisma.army.delete({
      where: { id },
    });
  }

  private calculateArmyStats(army: Army & { miniatures: Array<{ status: MiniatureStatus; points: number; modelCount: number }> }): ArmyWithStats {
    const byStatus = Object.values(MiniatureStatus).reduce(
      (acc, status) => ({ ...acc, [status]: 0 }),
      {} as Record<MiniatureStatus, number>
    );

    let totalMiniatures = 0;
    let totalModels = 0;
    let currentPoints = 0;
    let completedPoints = 0;

    army.miniatures.forEach((mini) => {
      totalMiniatures++;
      totalModels += mini.modelCount;
      currentPoints += mini.points;
      byStatus[mini.status]++;

      if (mini.status === MiniatureStatus.COMPLETE || mini.status === MiniatureStatus.PAINTED) {
        completedPoints += mini.points;
      }
    });

    const { miniatures, ...armyData } = army;

    return {
      ...armyData,
      stats: {
        totalMiniatures,
        totalModels,
        currentPoints,
        completedPoints,
        byStatus,
      },
    };
  }
}
