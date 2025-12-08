import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { RecipeDifficulty, RecipeWithSaved, RecipeStep } from '@minipaint-pro/types';
import {
  RecipeService,
  RecipeFilters,
} from '../../core/services/recipe.service';
import { PaintService } from '../../core/services/paint.service';

interface DifficultyOption {
  label: string;
  value: RecipeDifficulty;
}

const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
];

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [
    FormsModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    SelectModule,
    ButtonModule,
    ToggleButtonModule,
    DialogModule,
    TooltipModule,
    TagModule,
    DividerModule,
  ],
  templateUrl: './recipes.component.html',
  styleUrl: './recipes.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipesComponent {
  private readonly recipeService = inject(RecipeService);
  private readonly paintService = inject(PaintService);

  readonly difficultyOptions = DIFFICULTY_OPTIONS;

  readonly searchQuery = signal('');
  readonly selectedDifficulty = signal<RecipeDifficulty | null>(null);
  readonly selectedTag = signal<string | null>(null);
  readonly showSavedOnly = signal(false);

  readonly allTags = this.recipeService.allTags;
  readonly savedCount = this.recipeService.savedCount;
  readonly totalCount = this.recipeService.totalCount;

  readonly tagOptions = computed(() =>
    this.allTags().map((tag) => ({ label: tag, value: tag }))
  );

  readonly filters = computed<RecipeFilters>(() => ({
    search: this.searchQuery(),
    difficulty: this.selectedDifficulty(),
    tag: this.selectedTag(),
    saved: this.showSavedOnly(),
  }));

  readonly filteredRecipes = computed(() =>
    this.recipeService.getFilteredRecipes(this.filters())
  );

  readonly hasActiveFilters = computed(
    () =>
      this.searchQuery().length > 0 ||
      this.selectedDifficulty() !== null ||
      this.selectedTag() !== null ||
      this.showSavedOnly()
  );

  selectedRecipe = signal<RecipeWithSaved | null>(null);
  detailDialogVisible = signal(false);

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedDifficulty.set(null);
    this.selectedTag.set(null);
    this.showSavedOnly.set(false);
  }

  onToggleSaved(recipe: RecipeWithSaved, event: Event): void {
    event.stopPropagation();
    this.recipeService.toggleSaved(recipe.id);
  }

  onRecipeClick(recipe: RecipeWithSaved): void {
    this.selectedRecipe.set(recipe);
    this.detailDialogVisible.set(true);
  }

  closeDetailDialog(): void {
    this.detailDialogVisible.set(false);
    this.selectedRecipe.set(null);
  }

  getDifficultyLabel(difficulty: RecipeDifficulty): string {
    return this.recipeService.getDifficultyLabel(difficulty);
  }

  getDifficultySeverity(difficulty: RecipeDifficulty): 'success' | 'warn' | 'danger' {
    const severities: Record<RecipeDifficulty, 'success' | 'warn' | 'danger'> = {
      beginner: 'success',
      intermediate: 'warn',
      advanced: 'danger',
    };
    return severities[difficulty];
  }

  formatTime(minutes: number): string {
    return this.recipeService.formatTime(minutes);
  }

  getPaintName(paintId: string | undefined): string {
    if (!paintId) return '';
    const paint = this.paintService.getPaintById(paintId);
    return paint?.name ?? '';
  }

  getPaintColor(paintId: string | undefined): string {
    if (!paintId) return 'transparent';
    const paint = this.paintService.getPaintById(paintId);
    return paint?.colorHex ?? 'transparent';
  }

  isPaintOwned(paintId: string | undefined): boolean {
    if (!paintId) return true;
    const paint = this.paintService.getPaintById(paintId);
    return paint?.owned ?? false;
  }

  getRecipePaintsCount(recipe: RecipeWithSaved): number {
    if (!recipe.steps) return 0;
    const paintIds = new Set(recipe.steps.filter(s => s.paintId).map(s => s.paintId));
    return paintIds.size;
  }

  getOwnedPaintsCount(recipe: RecipeWithSaved): number {
    if (!recipe.steps) return 0;
    const paintIds = new Set(recipe.steps.filter(s => s.paintId).map(s => s.paintId));
    return Array.from(paintIds).filter(id => this.isPaintOwned(id)).length;
  }

  trackRecipe(_index: number, recipe: RecipeWithSaved): string {
    return recipe.id;
  }

  trackStep(_index: number, step: RecipeStep): string {
    return step.id;
  }
}
