export type GameSystem =
  | 'warhammer40k'
  | 'ageOfSigmar'
  | 'killTeam'
  | 'necromunda'
  | 'horusHeresy'
  | 'other';

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
