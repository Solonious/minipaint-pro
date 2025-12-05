export type MiniatureStatus = 'unbuilt' | 'assembled' | 'primed' | 'wip' | 'painted' | 'complete';

export interface Miniature {
  id: string;
  name: string;
  faction: string;
  armyId?: string;
  points: number;
  modelCount: number;
  status: MiniatureStatus;
  cost?: number;
  createdAt: string;
  updatedAt: string;
}
