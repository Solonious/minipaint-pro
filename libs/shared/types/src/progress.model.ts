export type GoalType = 'models' | 'hours' | 'characters' | 'vehicles';

export interface Achievement {
  id: string;
  emoji: string;
  name: string;
  description: string;
  requirementType: string;
  requirementValue: number;
}

export interface UserAchievement {
  id: string;
  progressId: string;
  achievementId: string;
  unlockedAt: string;
  achievement?: Achievement;
}

export interface Goal {
  id: string;
  progressId: string;
  name: string;
  type: GoalType;
  targetValue: number;
  currentValue: number;
  weekStart: string;
  weekEnd: string;
}

export interface UserEvent {
  id: string;
  progressId: string;
  name: string;
  eventDate: string;
  targetPoints: number;
  armyId?: string;
  notes?: string;
  createdAt: string;
}

export interface UserProgress {
  id: string;
  visitorId?: string;
  userId?: string;
  currentStreak: number;
  bestStreak: number;
  lastPaintedDate: string | null;
  totalModelsPainted: number;
  totalHoursPainted: number;
  updatedAt: string;
  achievements?: UserAchievement[];
  goals?: Goal[];
  events?: UserEvent[];
}

export interface CreateGoalDto {
  name: string;
  type: GoalType;
  targetValue: number;
  weekStart: string;
  weekEnd: string;
}

export interface UpdateGoalDto {
  name?: string;
  type?: GoalType;
  targetValue?: number;
  currentValue?: number;
}

export interface CreateEventDto {
  name: string;
  eventDate: string;
  targetPoints: number;
  armyId?: string;
  notes?: string;
}

export interface UpdateEventDto {
  name?: string;
  eventDate?: string;
  targetPoints?: number;
  armyId?: string | null;
  notes?: string | null;
}

export interface UpdateProgressDto {
  currentStreak?: number;
  bestStreak?: number;
  lastPaintedDate?: string | null;
  totalModelsPainted?: number;
  totalHoursPainted?: number;
}
