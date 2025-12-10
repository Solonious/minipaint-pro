import { Injectable, computed, effect, inject, signal } from '@angular/core';
import {
  Achievement,
  Goal,
  GoalType,
  UserProgress,
  CreateGoalDto,
  UpdateGoalDto,
} from '@minipaint-pro/types';
import { StorageService } from './storage.service';
import { MiniatureService } from './miniature.service';

const PROGRESS_STORAGE_KEY = 'minipaint_progress';
const GOALS_STORAGE_KEY = 'minipaint_goals';

export interface AchievementWithStatus extends Achievement {
  unlocked: boolean;
  unlockedAt?: string;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_model',
    emoji: '🎨',
    name: 'First Brush',
    description: 'Complete your first miniature',
    requirementType: 'models_painted',
    requirementValue: 1,
  },
  {
    id: 'models_5',
    emoji: '⭐',
    name: 'Getting Started',
    description: 'Complete 5 miniatures',
    requirementType: 'models_painted',
    requirementValue: 5,
  },
  {
    id: 'models_10',
    emoji: '🌟',
    name: 'Hobbyist',
    description: 'Complete 10 miniatures',
    requirementType: 'models_painted',
    requirementValue: 10,
  },
  {
    id: 'models_25',
    emoji: '💫',
    name: 'Dedicated Painter',
    description: 'Complete 25 miniatures',
    requirementType: 'models_painted',
    requirementValue: 25,
  },
  {
    id: 'models_50',
    emoji: '🏆',
    name: 'Master Painter',
    description: 'Complete 50 miniatures',
    requirementType: 'models_painted',
    requirementValue: 50,
  },
  {
    id: 'models_100',
    emoji: '👑',
    name: 'Legendary Artist',
    description: 'Complete 100 miniatures',
    requirementType: 'models_painted',
    requirementValue: 100,
  },
  {
    id: 'streak_3',
    emoji: '🔥',
    name: 'On Fire',
    description: 'Maintain a 3-day painting streak',
    requirementType: 'streak',
    requirementValue: 3,
  },
  {
    id: 'streak_7',
    emoji: '🔥',
    name: 'Week Warrior',
    description: 'Maintain a 7-day painting streak',
    requirementType: 'streak',
    requirementValue: 7,
  },
  {
    id: 'streak_14',
    emoji: '🔥',
    name: 'Fortnight Fury',
    description: 'Maintain a 14-day painting streak',
    requirementType: 'streak',
    requirementValue: 14,
  },
  {
    id: 'streak_30',
    emoji: '🔥',
    name: 'Monthly Master',
    description: 'Maintain a 30-day painting streak',
    requirementType: 'streak',
    requirementValue: 30,
  },
  {
    id: 'points_500',
    emoji: '⚔️',
    name: 'Patrol Ready',
    description: 'Paint 500 points worth of models',
    requirementType: 'points',
    requirementValue: 500,
  },
  {
    id: 'points_1000',
    emoji: '🛡️',
    name: 'Combat Patrol',
    description: 'Paint 1000 points worth of models',
    requirementType: 'points',
    requirementValue: 1000,
  },
  {
    id: 'points_2000',
    emoji: '⚔️',
    name: 'Strike Force',
    description: 'Paint 2000 points worth of models',
    requirementType: 'points',
    requirementValue: 2000,
  },
  {
    id: 'points_3000',
    emoji: '🏰',
    name: 'Onslaught',
    description: 'Paint 3000 points worth of models',
    requirementType: 'points',
    requirementValue: 3000,
  },
  {
    id: 'pile_shame_clear',
    emoji: '✨',
    name: 'Shame No More',
    description: 'Complete all miniatures in your pile',
    requirementType: 'pile_clear',
    requirementValue: 1,
  },
  {
    id: 'goal_complete',
    emoji: '🎯',
    name: 'Goal Getter',
    description: 'Complete a weekly goal',
    requirementType: 'goals_completed',
    requirementValue: 1,
  },
];

@Injectable({
  providedIn: 'root',
})
export class ProgressService {
  private readonly storage = inject(StorageService);
  private readonly miniatureService = inject(MiniatureService);

  private readonly progressSignal = signal<UserProgress>(this.loadProgressFromStorage());
  private readonly goalsSignal = signal<Goal[]>(this.loadGoalsFromStorage());
  private readonly unlockedAchievementIds = signal<Set<string>>(
    new Set(this.progressSignal().achievements?.map((a) => a.achievementId) ?? [])
  );

  readonly progress = this.progressSignal.asReadonly();
  readonly goals = this.goalsSignal.asReadonly();

  readonly currentStreak = computed(() => this.progressSignal().currentStreak);
  readonly bestStreak = computed(() => this.progressSignal().bestStreak);
  readonly lastPaintedDate = computed(() => this.progressSignal().lastPaintedDate);
  readonly totalModelsPainted = computed(() => this.miniatureService.completedCount());
  readonly totalPoints = computed(() => {
    const miniatures = this.miniatureService.miniatures();
    return miniatures
      .filter((m) => m.status === 'complete')
      .reduce((sum, m) => sum + m.points, 0);
  });

  readonly achievementsWithStatus = computed<AchievementWithStatus[]>(() => {
    const unlockedIds = this.unlockedAchievementIds();
    const progress = this.progressSignal();
    const achievements = progress.achievements ?? [];

    return ACHIEVEMENTS.map((achievement) => {
      const userAchievement = achievements.find((ua) => ua.achievementId === achievement.id);
      return {
        ...achievement,
        unlocked: unlockedIds.has(achievement.id),
        unlockedAt: userAchievement?.unlockedAt,
      };
    });
  });

  readonly unlockedCount = computed(
    () => this.achievementsWithStatus().filter((a) => a.unlocked).length
  );

  readonly totalAchievements = computed(() => ACHIEVEMENTS.length);

  readonly activeGoals = computed(() => {
    const now = new Date();
    return this.goalsSignal().filter((goal) => {
      const endDate = new Date(goal.weekEnd);
      return endDate >= now;
    });
  });

  readonly completedGoalsCount = computed(
    () => this.goalsSignal().filter((g) => g.currentValue >= g.targetValue).length
  );

  readonly isPileClear = computed(() => {
    const miniatures = this.miniatureService.miniatures();
    return miniatures.length > 0 && miniatures.every((m) => m.status === 'complete');
  });

  constructor() {
    effect(() => {
      this.saveProgressToStorage(this.progressSignal());
    });

    effect(() => {
      this.saveGoalsToStorage(this.goalsSignal());
    });

    effect(() => {
      this.checkAndUnlockAchievements();
    });
  }

  private loadProgressFromStorage(): UserProgress {
    const stored = this.storage.get<UserProgress>(PROGRESS_STORAGE_KEY);
    if (stored) {
      return stored;
    }
    return {
      id: `progress_${Date.now()}`,
      currentStreak: 0,
      bestStreak: 0,
      lastPaintedDate: null,
      totalModelsPainted: 0,
      totalHoursPainted: 0,
      updatedAt: new Date().toISOString(),
      achievements: [],
      goals: [],
      events: [],
    };
  }

  private saveProgressToStorage(progress: UserProgress): void {
    this.storage.set(PROGRESS_STORAGE_KEY, progress);
  }

  private loadGoalsFromStorage(): Goal[] {
    return this.storage.get<Goal[]>(GOALS_STORAGE_KEY) ?? [];
  }

  private saveGoalsToStorage(goals: Goal[]): void {
    this.storage.set(GOALS_STORAGE_KEY, goals);
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private checkAndUnlockAchievements(): void {
    const modelsPainted = this.totalModelsPainted();
    const currentStreak = this.currentStreak();
    const bestStreak = this.bestStreak();
    const totalPoints = this.totalPoints();
    const isPileClear = this.isPileClear();
    const goalsCompleted = this.completedGoalsCount();

    const newUnlocks: string[] = [];

    for (const achievement of ACHIEVEMENTS) {
      if (this.unlockedAchievementIds().has(achievement.id)) {
        continue;
      }

      let shouldUnlock = false;

      switch (achievement.requirementType) {
        case 'models_painted':
          shouldUnlock = modelsPainted >= achievement.requirementValue;
          break;
        case 'streak':
          shouldUnlock = Math.max(currentStreak, bestStreak) >= achievement.requirementValue;
          break;
        case 'points':
          shouldUnlock = totalPoints >= achievement.requirementValue;
          break;
        case 'pile_clear':
          shouldUnlock = isPileClear;
          break;
        case 'goals_completed':
          shouldUnlock = goalsCompleted >= achievement.requirementValue;
          break;
      }

      if (shouldUnlock) {
        newUnlocks.push(achievement.id);
      }
    }

    if (newUnlocks.length > 0) {
      this.unlockAchievements(newUnlocks);
    }
  }

  private unlockAchievements(achievementIds: string[]): void {
    const now = new Date().toISOString();

    this.progressSignal.update((progress) => ({
      ...progress,
      achievements: [
        ...(progress.achievements ?? []),
        ...achievementIds.map((id) => ({
          id: this.generateId('ua'),
          progressId: progress.id,
          achievementId: id,
          unlockedAt: now,
        })),
      ],
      updatedAt: now,
    }));

    this.unlockedAchievementIds.update((set) => {
      const newSet = new Set(set);
      achievementIds.forEach((id) => newSet.add(id));
      return newSet;
    });
  }

  logPaintingSession(): void {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = this.progressSignal().lastPaintedDate;

    let newStreak = 1;
    if (lastDate) {
      const lastDateObj = new Date(lastDate);
      const todayObj = new Date(today);
      const diffDays = Math.floor(
        (todayObj.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 0) {
        return;
      } else if (diffDays === 1) {
        newStreak = this.progressSignal().currentStreak + 1;
      }
    }

    this.progressSignal.update((progress) => ({
      ...progress,
      currentStreak: newStreak,
      bestStreak: Math.max(progress.bestStreak, newStreak),
      lastPaintedDate: today,
      updatedAt: new Date().toISOString(),
    }));
  }

  resetStreak(): void {
    this.progressSignal.update((progress) => ({
      ...progress,
      currentStreak: 0,
      lastPaintedDate: null,
      updatedAt: new Date().toISOString(),
    }));
  }

  addGoal(dto: CreateGoalDto): Goal {
    const goal: Goal = {
      id: this.generateId('goal'),
      progressId: this.progressSignal().id,
      name: dto.name,
      type: dto.type,
      targetValue: dto.targetValue,
      currentValue: 0,
      weekStart: dto.weekStart,
      weekEnd: dto.weekEnd,
    };

    this.goalsSignal.update((goals) => [...goals, goal]);
    return goal;
  }

  updateGoal(id: string, dto: UpdateGoalDto): Goal | null {
    let updated: Goal | null = null;

    this.goalsSignal.update((goals) =>
      goals.map((g) => {
        if (g.id === id) {
          updated = { ...g, ...dto };
          return updated;
        }
        return g;
      })
    );

    return updated;
  }

  incrementGoalProgress(id: string, amount = 1): void {
    this.goalsSignal.update((goals) =>
      goals.map((g) => {
        if (g.id === id) {
          return {
            ...g,
            currentValue: Math.min(g.currentValue + amount, g.targetValue),
          };
        }
        return g;
      })
    );
  }

  deleteGoal(id: string): void {
    this.goalsSignal.update((goals) => goals.filter((g) => g.id !== id));
  }

  getWeekDates(): { start: string; end: string } {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0],
    };
  }

  getGoalTypeLabel(type: GoalType): string {
    const labels: Record<GoalType, string> = {
      models: 'Models',
      hours: 'Hours',
      characters: 'Characters',
      vehicles: 'Vehicles',
    };
    return labels[type] ?? type;
  }

  /**
   * Clears all user-specific progress data.
   * Should be called on user logout to reset state for the next user.
   */
  clearData(): void {
    this.progressSignal.set({
      id: `progress_${Date.now()}`,
      currentStreak: 0,
      bestStreak: 0,
      lastPaintedDate: null,
      totalModelsPainted: 0,
      totalHoursPainted: 0,
      updatedAt: new Date().toISOString(),
      achievements: [],
      goals: [],
      events: [],
    });
    this.goalsSignal.set([]);
    this.unlockedAchievementIds.set(new Set());
  }
}
