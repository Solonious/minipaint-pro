export type PaintBrand = 'citadel' | 'vallejo' | 'army_painter' | 'scale75' | 'other';
export type PaintType = 'base' | 'layer' | 'shade' | 'contrast' | 'technical' | 'dry';

export interface Paint {
  id: string;
  name: string;
  brand: PaintBrand;
  type: PaintType;
  colorHex: string;
  owned: boolean;
}
