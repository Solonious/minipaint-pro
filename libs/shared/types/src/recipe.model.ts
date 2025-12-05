export type RecipeDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface RecipeStep {
  id: string;
  order: number;
  description: string;
  paintIds: string[];
  technique?: string;
  imageUrl?: string;
}

export interface Recipe {
  id: string;
  name: string;
  authorName: string;
  difficulty: RecipeDifficulty;
  timeMinutes: number;
  rating: number;
  steps: RecipeStep[];
  paintIds: string[];
  previewColorHex: string;
  saved: boolean;
}
