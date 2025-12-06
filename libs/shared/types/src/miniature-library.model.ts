import { Miniature } from './miniature.model';
import { Paint } from './paint.model';

// ============================================
// Image Types
// ============================================

export type MiniatureImageType = 'reference' | 'wip' | 'completed' | 'detail';

export interface MiniatureImage {
  id: string;
  miniatureId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  caption?: string;
  imageType: MiniatureImageType;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMiniatureImageDto {
  miniatureId: string;
  caption?: string;
  imageType?: MiniatureImageType;
  order?: number;
}

export interface UpdateMiniatureImageDto {
  caption?: string;
  imageType?: MiniatureImageType;
  order?: number;
}

// ============================================
// Color Scheme Types
// ============================================

export interface SectionPaint {
  id: string;
  sectionId: string;
  paintId: string;
  order: number;
  technique?: string;
  notes?: string;
  paint?: Paint;
}

export interface ColorSchemeSection {
  id: string;
  schemeId: string;
  areaName: string;
  order: number;
  paints: SectionPaint[];
  createdAt: string;
  updatedAt: string;
}

export interface ColorScheme {
  id: string;
  miniatureId: string;
  name: string;
  sections: ColorSchemeSection[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSectionPaintDto {
  paintId: string;
  order?: number;
  technique?: string;
  notes?: string;
}

export interface CreateColorSchemeSectionDto {
  areaName: string;
  order?: number;
  paints: CreateSectionPaintDto[];
}

export interface CreateColorSchemeDto {
  miniatureId: string;
  name: string;
  sections: CreateColorSchemeSectionDto[];
}

export interface UpdateColorSchemeDto {
  name?: string;
}

export interface UpdateColorSchemeSectionDto {
  areaName?: string;
  order?: number;
}

export interface UpdateSectionPaintDto {
  order?: number;
  technique?: string;
  notes?: string;
}

// ============================================
// Tutorial Types
// ============================================

export type VideoPlatform = 'youtube' | 'vimeo' | 'custom';

export interface MiniatureTutorial {
  id: string;
  miniatureId: string;
  title: string;
  videoUrl: string;
  platform: VideoPlatform;
  duration?: number;
  author?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMiniatureTutorialDto {
  miniatureId: string;
  title: string;
  videoUrl: string;
  platform?: VideoPlatform;
  duration?: number;
  author?: string;
  order?: number;
}

export interface UpdateMiniatureTutorialDto {
  title?: string;
  videoUrl?: string;
  platform?: VideoPlatform;
  duration?: number;
  author?: string;
  order?: number;
}

// ============================================
// Extended Miniature with Library Data
// ============================================

export interface MiniatureWithLibrary extends Miniature {
  images: MiniatureImage[];
  colorScheme?: ColorScheme;
  tutorials: MiniatureTutorial[];
}

// ============================================
// Reorder DTOs
// ============================================

export interface ReorderImagesDto {
  miniatureId: string;
  imageIds: string[];
}

export interface ReorderTutorialsDto {
  miniatureId: string;
  tutorialIds: string[];
}

export interface ReorderSectionsDto {
  schemeId: string;
  sectionIds: string[];
}

export interface ReorderSectionPaintsDto {
  sectionId: string;
  paintIds: string[];
}
