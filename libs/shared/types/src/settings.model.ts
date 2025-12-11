import { GameSystem } from './army.model';
import { PaintBrand } from './paint.model';

export type ViewMode = 'GRID' | 'LIST';
export type SortOrder = 'ASC' | 'DESC';

export interface UserPreferences {
  id: string;
  userId: string;
  defaultGameSystem: GameSystem | null;
  defaultPaintBrand: PaintBrand | null;
  itemsPerPage: number;
  defaultViewMode: ViewMode;
  showCompletedMinis: boolean;
  defaultSortField: string;
  defaultSortOrder: SortOrder;
  emailNotifications: boolean;
  streakReminders: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface ActiveSession {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export interface UpdateProfileDto {
  displayName?: string;
  email?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UpdatePreferencesDto {
  defaultGameSystem?: GameSystem | null;
  defaultPaintBrand?: PaintBrand | null;
  itemsPerPage?: number;
  defaultViewMode?: ViewMode;
  showCompletedMinis?: boolean;
  defaultSortField?: string;
  defaultSortOrder?: SortOrder;
  emailNotifications?: boolean;
  streakReminders?: boolean;
}
