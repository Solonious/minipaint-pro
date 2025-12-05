export type PaintBrand =
  | 'citadel'
  | 'vallejo'
  | 'armyPainter'
  | 'scale75'
  | 'akInteractive'
  | 'turboDork'
  | 'other';

export type PaintType =
  | 'base'
  | 'layer'
  | 'shade'
  | 'contrast'
  | 'technical'
  | 'dry'
  | 'air'
  | 'metallic';

export interface Paint {
  id: string;
  name: string;
  brand: PaintBrand;
  type: PaintType;
  colorHex: string;
  isOfficial: boolean;
  createdAt: string;
}

export interface UserPaint {
  id: string;
  userId?: string;
  paintId: string;
  owned: boolean;
  wishlist: boolean;
  createdAt: string;
  updatedAt: string;
  paint?: Paint;
}

export interface PaintWithOwnership extends Paint {
  owned: boolean;
  wishlist: boolean;
}

export interface PaintEquivalent {
  id: string;
  paintId: string;
  equivalentId: string;
  paint?: Paint;
  equivalent?: Paint;
}

export interface CreateUserPaintDto {
  paintId: string;
  owned?: boolean;
  wishlist?: boolean;
}

export interface UpdateUserPaintDto {
  owned?: boolean;
  wishlist?: boolean;
}
