import { GameSystem } from './army.model';

export type MiniatureStatus =
  | 'unbuilt'
  | 'assembled'
  | 'primed'
  | 'wip'
  | 'painted'
  | 'complete';

// Substates for UNBUILT status
export type UnbuiltState = 'inbox' | 'on_sprue' | 'clipped' | 'ready';

// Substates for WIP status (painting stages)
export type WipStage =
  | 'base_coated'
  | 'blocking'
  | 'layering'
  | 'washing'
  | 'highlighting'
  | 'detailing'
  | 'basing';

// Tags that can apply to any miniature regardless of status
export type MiniatureTag =
  | 'magnetized'
  | 'pinned'
  | 'sub_assemblies'
  | 'based'
  | 'contrast_method'
  | 'varnished'
  | 'decals_applied'
  | 'display_quality'
  | 'tabletop_ready';

// Stage counts for multi-model tracking
export interface ModelStageCounts {
  unbuilt: number;
  assembled: number;
  primed: number;
  wip: number;
  painted: number;
  complete: number;
}

// Helper to create default stage counts based on model count
export function createDefaultStageCounts(
  modelCount: number,
  initialStatus: MiniatureStatus = 'unbuilt'
): ModelStageCounts {
  const counts: ModelStageCounts = {
    unbuilt: 0,
    assembled: 0,
    primed: 0,
    wip: 0,
    painted: 0,
    complete: 0,
  };
  counts[initialStatus] = modelCount;
  return counts;
}

// Compute the overall status from stage counts (minimum stage with models > 0)
export function computeStatusFromCounts(stageCounts: ModelStageCounts): MiniatureStatus {
  const stages: MiniatureStatus[] = [
    'unbuilt',
    'assembled',
    'primed',
    'wip',
    'painted',
    'complete',
  ];

  for (const stage of stages) {
    if (stageCounts[stage] > 0) {
      return stage;
    }
  }
  return 'unbuilt';
}

// Calculate completed models count from stage counts
export function calculateModelsCompleted(stageCounts: ModelStageCounts): number {
  return stageCounts.complete;
}

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

  // Multi-model stage tracking
  stageCounts?: ModelStageCounts;

  // Substates for detailed tracking
  unbuiltState?: UnbuiltState;
  wipStage?: WipStage;

  // Tags that apply to the entire unit
  tags: MiniatureTag[];

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
  stageCounts?: ModelStageCounts;
  unbuiltState?: UnbuiltState;
  wipStage?: WipStage;
  tags?: MiniatureTag[];
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
  stageCounts?: ModelStageCounts | null;
  unbuiltState?: UnbuiltState | null;
  wipStage?: WipStage | null;
  tags?: MiniatureTag[];
  cost?: number | null;
  notes?: string | null;
  imageUrl?: string | null;
}

// DTO for moving models between stages
export interface MoveModelsDto {
  fromStage: MiniatureStatus;
  toStage: MiniatureStatus;
  count: number;
}

// DTO for updating stage counts directly
export interface UpdateStageCountsDto {
  stageCounts: ModelStageCounts;
}

// Filter interface for advanced filtering (Phase 1)
export interface MiniatureFilters {
  search: string;
  gameSystem: GameSystem | null;
  faction: string | null;
  armyId: string | null;
}
