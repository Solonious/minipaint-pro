import { Paint } from './paint.model';

export type RecipeDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface RecipeStep {
  id: string;
  recipeId: string;
  order: number;
  instruction: string;
  paintId?: string;
  technique?: string;
  imageUrl?: string;
  paint?: Paint;
}

export interface Recipe {
  id: string;
  userId?: string;
  authorName: string;
  name: string;
  difficulty: RecipeDifficulty;
  timeMinutes: number;
  previewColorHex: string;
  rating: number;
  ratingCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  steps?: RecipeStep[];
}

export interface RecipeWithSaved extends Recipe {
  saved: boolean;
}

export interface SavedRecipe {
  id: string;
  userId?: string;
  recipeId: string;
  savedAt: string;
  recipe?: Recipe;
}

export interface CreateRecipeDto {
  name: string;
  authorName: string;
  difficulty: RecipeDifficulty;
  timeMinutes: number;
  previewColorHex: string;
  tags?: string[];
  steps: CreateRecipeStepDto[];
}

export interface CreateRecipeStepDto {
  order: number;
  instruction: string;
  paintId?: string;
  technique?: string;
  imageUrl?: string;
}

export interface UpdateRecipeDto {
  name?: string;
  authorName?: string;
  difficulty?: RecipeDifficulty;
  timeMinutes?: number;
  previewColorHex?: string;
  tags?: string[];
}

export interface UpdateRecipeStepDto {
  order?: number;
  instruction?: string;
  paintId?: string | null;
  technique?: string | null;
  imageUrl?: string | null;
}
