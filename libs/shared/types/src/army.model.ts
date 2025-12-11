export type GameSystem =
  | 'WARHAMMER_40K'
  | 'AGE_OF_SIGMAR'
  | 'KILL_TEAM'
  | 'NECROMUNDA'
  | 'HORUS_HERESY'
  | 'OTHER';

export interface Army {
  id: string;
  userId?: string;
  name: string;
  faction: string;
  gameSystem: GameSystem;
  targetPoints: number;
  iconEmoji?: string;
  colorHex?: string;
  backgroundImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArmyWithProgress extends Army {
  miniatureCount: number;
  completedCount: number;
  currentPoints: number;
  progressPercentage: number;
}

export interface CreateArmyDto {
  name: string;
  faction: string;
  gameSystem: GameSystem;
  targetPoints: number;
  iconEmoji?: string;
  colorHex?: string;
  backgroundImageUrl?: string;
}

export interface UpdateArmyDto {
  name?: string;
  faction?: string;
  gameSystem?: GameSystem;
  targetPoints?: number;
  iconEmoji?: string | null;
  colorHex?: string | null;
  backgroundImageUrl?: string | null;
}
