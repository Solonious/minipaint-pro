import { GameSystem } from './army.model';

export interface UnitTemplate {
  id: string;
  userId?: string;
  name: string;
  faction: string;
  gameSystem: GameSystem;
  defaultPoints: number;
  defaultModelCount: number;
  wahapediaUnitId?: string;
  wahapediaUrl?: string;
  usageCount: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUnitTemplateDto {
  name: string;
  faction: string;
  gameSystem: GameSystem;
  defaultPoints?: number;
  defaultModelCount?: number;
  wahapediaUnitId?: string;
  wahapediaUrl?: string;
}

export interface UpdateUnitTemplateDto {
  name?: string;
  faction?: string;
  gameSystem?: GameSystem;
  defaultPoints?: number;
  defaultModelCount?: number;
  wahapediaUnitId?: string;
  wahapediaUrl?: string;
}

export interface UnitTemplateSearchResult {
  source: 'library' | 'wahapedia';
  template?: UnitTemplate;
  wahapediaUnit?: {
    id: string;
    name: string;
    factionId: string;
    factionName: string;
    role: string;
    link: string;
  };
}
