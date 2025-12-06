export type UnitGameSystem = 'wh40k10ed' | 'wh40k9ed' | 'killteam' | 'aos';

export interface WahapediaFaction {
  id: string;
  name: string;
  link: string;
}

export interface WahapediaUnit {
  id: string;
  name: string;
  factionId: string;
  sourceId: string;
  legend: string;
  role: string;
  loadout: string;
  transport: string;
  virtual: boolean;
  link: string;
}

export interface UnitOption {
  id: string;
  name: string;
  factionId: string;
  factionName: string;
  role: string;
  link: string;
}
