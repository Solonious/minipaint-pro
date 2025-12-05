export type GameSystem = '40k' | 'aos' | 'killteam' | 'other';

export interface Army {
  id: string;
  name: string;
  faction: string;
  gameSystem: GameSystem;
  targetPoints: number;
  iconEmoji?: string;
}
