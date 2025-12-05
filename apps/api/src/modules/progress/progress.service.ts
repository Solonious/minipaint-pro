import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LogSessionDto } from './dto/log-session.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { UserProgress, Achievement } from '@prisma/client';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async getProgress(userId: string): Promise<UserProgress | null> {
    let progress = await this.prisma.userProgress.findUnique({
      where: { userId },
      include: {
        achievements: {
          include: { achievement: true },
        },
        goals: true,
      },
    });

    if (!progress) {
      progress = await this.prisma.userProgress.create({
        data: { userId },
        include: {
          achievements: {
            include: { achievement: true },
          },
          goals: true,
        },
      });
    }

    return progress;
  }

  async logSession(userId: string, dto: LogSessionDto): Promise<UserProgress> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let progress = await this.prisma.userProgress.findUnique({
      where: { userId },
    });

    if (!progress) {
      progress = await this.prisma.userProgress.create({
        data: { userId },
      });
    }

    const lastPainted = progress.lastPaintedDate;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = 1;
    if (lastPainted) {
      const lastPaintedDate = new Date(lastPainted);
      lastPaintedDate.setHours(0, 0, 0, 0);

      if (lastPaintedDate.getTime() === yesterday.getTime()) {
        newStreak = progress.currentStreak + 1;
      } else if (lastPaintedDate.getTime() === today.getTime()) {
        newStreak = progress.currentStreak;
      }
    }

    const totalHours = Number(progress.totalHoursPainted) + (dto.hoursPainted || 0);

    return this.prisma.userProgress.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        bestStreak: Math.max(newStreak, progress.bestStreak),
        lastPaintedDate: today,
        totalModelsPainted: progress.totalModelsPainted + dto.modelsPainted,
        totalHoursPainted: totalHours,
      },
      include: {
        achievements: {
          include: { achievement: true },
        },
        goals: true,
      },
    });
  }

  async getAchievements(): Promise<Achievement[]> {
    return this.prisma.achievement.findMany({
      orderBy: { requirementValue: 'asc' },
    });
  }

  async getGoals(userId: string): Promise<Array<{ id: string; name: string; type: string; targetValue: number; currentValue: number; weekStart: Date; weekEnd: Date }>> {
    const progress = await this.getProgress(userId);
    if (!progress) return [];

    return this.prisma.userGoal.findMany({
      where: { progressId: progress.id },
      orderBy: { weekEnd: 'desc' },
    });
  }

  async updateGoal(goalId: string, dto: UpdateGoalDto): Promise<{ id: string; currentValue: number }> {
    const goal = await this.prisma.userGoal.findUnique({
      where: { id: goalId },
    });

    if (!goal) {
      throw new NotFoundException(`Goal with ID ${goalId} not found`);
    }

    const updated = await this.prisma.userGoal.update({
      where: { id: goalId },
      data: { currentValue: dto.currentValue },
    });

    return { id: updated.id, currentValue: updated.currentValue };
  }
}
