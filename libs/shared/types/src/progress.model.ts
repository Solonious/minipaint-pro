export interface Achievement {
  achievementId: string;
  unlockedAt: string;
}

export interface Goal {
  id: string;
  title: string;
  targetCount: number;
  currentCount: number;
  type: 'miniatures' | 'models' | 'points';
  weekStart: string;
  weekEnd: string;
}

export interface UserProgress {
  currentStreak: number;
  bestStreak: number;
  lastPaintedDate: string | null;
  achievements: Achievement[];
  weeklyGoals: Goal[];
}
