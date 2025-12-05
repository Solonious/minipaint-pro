import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LogSessionDto } from './dto/log-session.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { Achievement, GoalType } from '@prisma/client';

interface AchievementWithStatus extends Achievement {
  unlocked: boolean;
  unlockedAt: Date | null;
}

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async getProgress(visitorId: string) {
    let progress = await this.prisma.userProgress.findUnique({
      where: { visitorId },
      include: {
        achievements: {
          include: { achievement: true },
        },
        goals: {
          orderBy: { weekEnd: 'desc' },
        },
      },
    });

    if (!progress) {
      progress = await this.createProgressWithDefaultGoals(visitorId);
    } else {
      // Check if we need to reset weekly goals
      await this.checkAndResetWeeklyGoals(progress.id);
      // Re-fetch with updated goals
      progress = await this.prisma.userProgress.findUnique({
        where: { visitorId },
        include: {
          achievements: {
            include: { achievement: true },
          },
          goals: {
            orderBy: { weekEnd: 'desc' },
          },
        },
      });
    }

    return progress!;
  }

  private async createProgressWithDefaultGoals(visitorId: string) {
    const { weekStart, weekEnd } = this.getCurrentWeekBounds();

    const progress = await this.prisma.userProgress.create({
      data: {
        visitorId,
        goals: {
          create: [
            {
              name: 'Paint 3 models this week',
              type: GoalType.MODELS,
              targetValue: 3,
              currentValue: 0,
              weekStart,
              weekEnd,
            },
            {
              name: 'Paint for 5 hours this week',
              type: GoalType.HOURS,
              targetValue: 5,
              currentValue: 0,
              weekStart,
              weekEnd,
            },
          ],
        },
      },
      include: {
        achievements: {
          include: { achievement: true },
        },
        goals: {
          orderBy: { weekEnd: 'desc' },
        },
      },
    });

    return progress;
  }

  private getCurrentWeekBounds(): { weekStart: Date; weekEnd: Date } {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diffToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return { weekStart, weekEnd };
  }

  private async checkAndResetWeeklyGoals(progressId: string): Promise<void> {
    const { weekStart, weekEnd } = this.getCurrentWeekBounds();

    // Check if current goals are for this week
    const currentGoals = await this.prisma.userGoal.findFirst({
      where: {
        progressId,
        weekStart: { gte: weekStart },
      },
    });

    if (!currentGoals) {
      // Delete old goals and create new ones for this week
      await this.prisma.userGoal.deleteMany({
        where: { progressId },
      });

      await this.prisma.userGoal.createMany({
        data: [
          {
            progressId,
            name: 'Paint 3 models this week',
            type: GoalType.MODELS,
            targetValue: 3,
            currentValue: 0,
            weekStart,
            weekEnd,
          },
          {
            progressId,
            name: 'Paint for 5 hours this week',
            type: GoalType.HOURS,
            targetValue: 5,
            currentValue: 0,
            weekStart,
            weekEnd,
          },
        ],
      });
    }
  }

  async logSession(visitorId: string, dto: LogSessionDto) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let progress = await this.prisma.userProgress.findUnique({
      where: { visitorId },
      include: {
        achievements: true,
      },
    });

    if (!progress) {
      const created = await this.createProgressWithDefaultGoals(visitorId);
      progress = await this.prisma.userProgress.findUnique({
        where: { id: created.id },
        include: { achievements: true },
      });
    }

    // Calculate streak
    const lastPainted = progress!.lastPaintedDate;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = 1;
    if (lastPainted) {
      const lastPaintedDate = new Date(lastPainted);
      lastPaintedDate.setHours(0, 0, 0, 0);

      if (lastPaintedDate.getTime() === yesterday.getTime()) {
        // Consecutive day - increase streak
        newStreak = progress!.currentStreak + 1;
      } else if (lastPaintedDate.getTime() === today.getTime()) {
        // Same day - keep streak
        newStreak = progress!.currentStreak;
      }
      // Otherwise, streak resets to 1
    }

    const totalHours = Number(progress!.totalHoursPainted) + (dto.hoursPainted || 0);
    const totalModels = progress!.totalModelsPainted + dto.modelsPainted;

    // Update progress
    await this.prisma.userProgress.update({
      where: { visitorId },
      data: {
        currentStreak: newStreak,
        bestStreak: Math.max(newStreak, progress!.bestStreak),
        lastPaintedDate: today,
        totalModelsPainted: totalModels,
        totalHoursPainted: totalHours,
      },
    });

    // Update weekly goals
    await this.updateWeeklyGoals(progress!.id, dto.modelsPainted, dto.hoursPainted || 0);

    // Check and unlock achievements
    const newAchievements = await this.checkAndUnlockAchievements(
      progress!.id,
      totalModels,
      newStreak,
      totalHours
    );

    // Fetch updated progress
    const updatedProgress = await this.prisma.userProgress.findUnique({
      where: { visitorId },
      include: {
        achievements: {
          include: { achievement: true },
        },
        goals: {
          orderBy: { weekEnd: 'desc' },
        },
      },
    });

    return {
      progress: updatedProgress!,
      newAchievements,
    };
  }

  private async updateWeeklyGoals(progressId: string, modelsPainted: number, hoursPainted: number): Promise<void> {
    const { weekStart } = this.getCurrentWeekBounds();

    // Update MODELS goal
    await this.prisma.userGoal.updateMany({
      where: {
        progressId,
        type: GoalType.MODELS,
        weekStart: { gte: weekStart },
      },
      data: {
        currentValue: { increment: modelsPainted },
      },
    });

    // Update HOURS goal
    await this.prisma.userGoal.updateMany({
      where: {
        progressId,
        type: GoalType.HOURS,
        weekStart: { gte: weekStart },
      },
      data: {
        currentValue: { increment: Math.floor(hoursPainted) },
      },
    });
  }

  private async checkAndUnlockAchievements(
    progressId: string,
    totalModels: number,
    currentStreak: number,
    totalHours: number
  ): Promise<Achievement[]> {
    // Get all achievements
    const allAchievements = await this.prisma.achievement.findMany();

    // Get already unlocked achievements
    const unlockedAchievements = await this.prisma.userAchievement.findMany({
      where: { progressId },
      select: { achievementId: true },
    });
    const unlockedIds = new Set(unlockedAchievements.map((ua) => ua.achievementId));

    const newlyUnlocked: Achievement[] = [];

    for (const achievement of allAchievements) {
      if (unlockedIds.has(achievement.id)) continue;

      let shouldUnlock = false;

      switch (achievement.requirementType) {
        case 'models_painted':
          shouldUnlock = totalModels >= achievement.requirementValue;
          break;
        case 'streak_days':
          shouldUnlock = currentStreak >= achievement.requirementValue;
          break;
        case 'hours_painted':
          shouldUnlock = totalHours >= achievement.requirementValue;
          break;
        // Other achievement types can be added as needed
      }

      if (shouldUnlock) {
        await this.prisma.userAchievement.create({
          data: {
            progressId,
            achievementId: achievement.id,
          },
        });
        newlyUnlocked.push(achievement);
      }
    }

    return newlyUnlocked;
  }

  async getAchievementsWithStatus(visitorId: string): Promise<AchievementWithStatus[]> {
    const allAchievements = await this.prisma.achievement.findMany({
      orderBy: [
        { requirementType: 'asc' },
        { requirementValue: 'asc' },
      ],
    });

    const progress = await this.prisma.userProgress.findUnique({
      where: { visitorId },
      include: {
        achievements: true,
      },
    });

    const unlockedMap = new Map<string, Date>();
    if (progress) {
      for (const ua of progress.achievements) {
        unlockedMap.set(ua.achievementId, ua.unlockedAt);
      }
    }

    return allAchievements.map((achievement) => ({
      ...achievement,
      unlocked: unlockedMap.has(achievement.id),
      unlockedAt: unlockedMap.get(achievement.id) || null,
    }));
  }

  async getGoals(visitorId: string) {
    const progress = await this.getProgress(visitorId);

    return progress.goals.map((goal) => ({
      ...goal,
      completed: goal.currentValue >= goal.targetValue,
    }));
  }

  async updateGoal(goalId: string, dto: UpdateGoalDto) {
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

    return {
      id: updated.id,
      currentValue: updated.currentValue,
      completed: updated.currentValue >= updated.targetValue,
    };
  }
}
