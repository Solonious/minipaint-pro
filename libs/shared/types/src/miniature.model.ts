import { GameSystem } from './army.model';

export type MiniatureStatus =
  | 'unbuilt'
  | 'assembled'
  | 'primed'
  | 'wip'
  | 'painted'
  | 'complete';

export interface Miniature {
  id: string;
  userId?: string;
  armyId?: string;
  name: string;
  faction: string;
  gameSystem?: GameSystem;
  unitId?: string;
  wahapediaUrl?: string;
  points: number;
  modelCount: number;
  modelsCompleted: number;
  status: MiniatureStatus;
  cost?: number;
  notes?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMiniatureDto {
  name: string;
  faction: string;
  gameSystem?: GameSystem;
  unitId?: string;
  wahapediaUrl?: string;
  armyId?: string;
  points: number;
  modelCount?: number;
  modelsCompleted?: number;
  status?: MiniatureStatus;
  cost?: number;
  notes?: string;
  imageUrl?: string;
}

export interface UpdateMiniatureDto {
  name?: string;
  faction?: string;
  gameSystem?: GameSystem | null;
  unitId?: string | null;
  wahapediaUrl?: string | null;
  armyId?: string | null;
  points?: number;
  modelCount?: number;
  modelsCompleted?: number;
  status?: MiniatureStatus;
  cost?: number | null;
  notes?: string | null;
  imageUrl?: string | null;
}
