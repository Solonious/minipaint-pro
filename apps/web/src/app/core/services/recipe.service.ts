import { Injectable, computed, effect, inject, signal } from '@angular/core';
import {
  Recipe,
  RecipeDifficulty,
  RecipeWithSaved,
} from '@minipaint-pro/types';
import { StorageService } from './storage.service';

const SAVED_RECIPES_STORAGE_KEY = 'minipaint_saved_recipes';

export interface RecipeFilters {
  search: string;
  difficulty: RecipeDifficulty | null;
  tag: string | null;
  saved: boolean;
}

const SAMPLE_RECIPES: Recipe[] = [
  {
    id: 'recipe_ultramarines_blue',
    authorName: 'Games Workshop',
    name: 'Classic Ultramarines Blue',
    difficulty: 'beginner',
    timeMinutes: 45,
    previewColorHex: '#0f3d7c',
    rating: 4.8,
    ratingCount: 1250,
    tags: ['Space Marines', 'Ultramarines', 'Blue', 'Armour'],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
    steps: [
      { id: 'step_1', recipeId: 'recipe_ultramarines_blue', order: 1, instruction: 'Basecoat with Macragge Blue', paintId: 'citadel_macragge_blue', technique: 'Base Coat' },
      { id: 'step_2', recipeId: 'recipe_ultramarines_blue', order: 2, instruction: 'Recess shade with Drakenhof Nightshade', paintId: 'citadel_drakenhof_nightshade', technique: 'Shade' },
      { id: 'step_3', recipeId: 'recipe_ultramarines_blue', order: 3, instruction: 'Layer with Calgar Blue, leaving recesses', paintId: 'citadel_calgar_blue', technique: 'Layer' },
      { id: 'step_4', recipeId: 'recipe_ultramarines_blue', order: 4, instruction: 'Edge highlight with Fenrisian Grey', paintId: 'citadel_fenrisian_grey', technique: 'Edge Highlight' },
      { id: 'step_5', recipeId: 'recipe_ultramarines_blue', order: 5, instruction: 'Fine edge highlight corners with Blue Horror', technique: 'Edge Highlight' },
    ],
  },
  {
    id: 'recipe_blood_angels_red',
    authorName: 'Games Workshop',
    name: 'Blood Angels Armour',
    difficulty: 'intermediate',
    timeMinutes: 60,
    previewColorHex: '#9a1115',
    rating: 4.7,
    ratingCount: 980,
    tags: ['Space Marines', 'Blood Angels', 'Red', 'Armour'],
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20',
    steps: [
      { id: 'step_1', recipeId: 'recipe_blood_angels_red', order: 1, instruction: 'Basecoat with Mephiston Red', paintId: 'citadel_mephiston_red', technique: 'Base Coat' },
      { id: 'step_2', recipeId: 'recipe_blood_angels_red', order: 2, instruction: 'Shade recesses with Carroburg Crimson', paintId: 'citadel_carroburg_crimson', technique: 'Shade' },
      { id: 'step_3', recipeId: 'recipe_blood_angels_red', order: 3, instruction: 'Layer raised areas with Evil Sunz Scarlet', paintId: 'citadel_evil_sunz_scarlet', technique: 'Layer' },
      { id: 'step_4', recipeId: 'recipe_blood_angels_red', order: 4, instruction: 'Edge highlight with Wild Rider Red', paintId: 'citadel_wild_rider_red', technique: 'Edge Highlight' },
      { id: 'step_5', recipeId: 'recipe_blood_angels_red', order: 5, instruction: 'Fine highlight corners with Fire Dragon Bright', paintId: 'citadel_fire_dragon_bright', technique: 'Edge Highlight' },
    ],
  },
  {
    id: 'recipe_dark_angels_green',
    authorName: 'Games Workshop',
    name: 'Dark Angels Green Armour',
    difficulty: 'beginner',
    timeMinutes: 40,
    previewColorHex: '#00401a',
    rating: 4.6,
    ratingCount: 756,
    tags: ['Space Marines', 'Dark Angels', 'Green', 'Armour'],
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01',
    steps: [
      { id: 'step_1', recipeId: 'recipe_dark_angels_green', order: 1, instruction: 'Basecoat with Caliban Green', paintId: 'citadel_caliban_green', technique: 'Base Coat' },
      { id: 'step_2', recipeId: 'recipe_dark_angels_green', order: 2, instruction: 'Shade with Nuln Oil', paintId: 'citadel_nuln_oil', technique: 'Shade' },
      { id: 'step_3', recipeId: 'recipe_dark_angels_green', order: 3, instruction: 'Layer with Warpstone Glow', paintId: 'citadel_warpstone_glow', technique: 'Layer' },
      { id: 'step_4', recipeId: 'recipe_dark_angels_green', order: 4, instruction: 'Edge highlight with Moot Green', paintId: 'citadel_moot_green', technique: 'Edge Highlight' },
    ],
  },
  {
    id: 'recipe_gold_nmm',
    authorName: 'MiniatureMaster',
    name: 'Non-Metallic Metal Gold',
    difficulty: 'advanced',
    timeMinutes: 120,
    previewColorHex: '#c9a227',
    rating: 4.9,
    ratingCount: 425,
    tags: ['NMM', 'Gold', 'Advanced', 'Metallic Effect'],
    createdAt: '2024-02-10',
    updatedAt: '2024-02-10',
    steps: [
      { id: 'step_1', recipeId: 'recipe_gold_nmm', order: 1, instruction: 'Basecoat with Rhinox Hide', paintId: 'citadel_rhinox_hide', technique: 'Base Coat' },
      { id: 'step_2', recipeId: 'recipe_gold_nmm', order: 2, instruction: 'Build up with Mournfang Brown', paintId: 'citadel_mournfang_brown', technique: 'Glaze' },
      { id: 'step_3', recipeId: 'recipe_gold_nmm', order: 3, instruction: 'Layer midtones with Zamesi Desert', paintId: 'citadel_zamesi_desert', technique: 'Layer' },
      { id: 'step_4', recipeId: 'recipe_gold_nmm', order: 4, instruction: 'Add bright spots with Yriel Yellow', paintId: 'citadel_yriel_yellow', technique: 'Layer' },
      { id: 'step_5', recipeId: 'recipe_gold_nmm', order: 5, instruction: 'Final highlights with Flash Gitz Yellow mixed with white', paintId: 'citadel_flash_gitz_yellow', technique: 'Highlight' },
      { id: 'step_6', recipeId: 'recipe_gold_nmm', order: 6, instruction: 'Glaze transitions with Seraphim Sepia', paintId: 'citadel_seraphim_sepia', technique: 'Glaze' },
    ],
  },
  {
    id: 'recipe_ork_skin',
    authorName: 'Games Workshop',
    name: 'Classic Ork Skin',
    difficulty: 'beginner',
    timeMinutes: 30,
    previewColorHex: '#1f5429',
    rating: 4.5,
    ratingCount: 1100,
    tags: ['Orks', 'Skin', 'Green', 'Quick'],
    createdAt: '2024-02-15',
    updatedAt: '2024-02-15',
    steps: [
      { id: 'step_1', recipeId: 'recipe_ork_skin', order: 1, instruction: 'Basecoat with Waaagh! Flesh', paintId: 'citadel_waaagh_flesh', technique: 'Base Coat' },
      { id: 'step_2', recipeId: 'recipe_ork_skin', order: 2, instruction: 'Shade all over with Biel-Tan Green', paintId: 'citadel_biel_tan_green', technique: 'Shade' },
      { id: 'step_3', recipeId: 'recipe_ork_skin', order: 3, instruction: 'Layer raised areas with Warboss Green', paintId: 'citadel_warboss_green', technique: 'Layer' },
      { id: 'step_4', recipeId: 'recipe_ork_skin', order: 4, instruction: 'Highlight with Skarsnik Green', paintId: 'citadel_skarsnik_green', technique: 'Highlight' },
    ],
  },
  {
    id: 'recipe_necron_silver',
    authorName: 'Games Workshop',
    name: 'Necron Metallic',
    difficulty: 'beginner',
    timeMinutes: 25,
    previewColorHex: '#888d8f',
    rating: 4.4,
    ratingCount: 890,
    tags: ['Necrons', 'Metallic', 'Silver', 'Quick'],
    createdAt: '2024-02-20',
    updatedAt: '2024-02-20',
    steps: [
      { id: 'step_1', recipeId: 'recipe_necron_silver', order: 1, instruction: 'Basecoat with Leadbelcher', paintId: 'citadel_leadbelcher', technique: 'Base Coat' },
      { id: 'step_2', recipeId: 'recipe_necron_silver', order: 2, instruction: 'Shade with Nuln Oil', paintId: 'citadel_nuln_oil', technique: 'Shade' },
      { id: 'step_3', recipeId: 'recipe_necron_silver', order: 3, instruction: 'Drybrush with Necron Compound', paintId: 'citadel_necron_compound', technique: 'Drybrush' },
      { id: 'step_4', recipeId: 'recipe_necron_silver', order: 4, instruction: 'Edge highlight with Stormhost Silver', paintId: 'citadel_stormhost_silver', technique: 'Edge Highlight' },
    ],
  },
  {
    id: 'recipe_flesh_tearers',
    authorName: 'ContrastKing',
    name: 'Quick Flesh Tearers (Contrast)',
    difficulty: 'beginner',
    timeMinutes: 20,
    previewColorHex: '#7a0a0a',
    rating: 4.3,
    ratingCount: 650,
    tags: ['Space Marines', 'Flesh Tearers', 'Contrast', 'Quick'],
    createdAt: '2024-03-01',
    updatedAt: '2024-03-01',
    steps: [
      { id: 'step_1', recipeId: 'recipe_flesh_tearers', order: 1, instruction: 'Prime with Grey Seer or Wraithbone', technique: 'Prime' },
      { id: 'step_2', recipeId: 'recipe_flesh_tearers', order: 2, instruction: 'Apply Flesh Tearers Red contrast', paintId: 'citadel_flesh_tearers_red', technique: 'Contrast' },
      { id: 'step_3', recipeId: 'recipe_flesh_tearers', order: 3, instruction: 'Edge highlight with Evil Sunz Scarlet', paintId: 'citadel_evil_sunz_scarlet', technique: 'Edge Highlight' },
    ],
  },
  {
    id: 'recipe_death_guard',
    authorName: 'Games Workshop',
    name: 'Death Guard Armour',
    difficulty: 'intermediate',
    timeMinutes: 50,
    previewColorHex: '#6d7c3d',
    rating: 4.6,
    ratingCount: 720,
    tags: ['Chaos', 'Death Guard', 'Green', 'Nurgle'],
    createdAt: '2024-03-10',
    updatedAt: '2024-03-10',
    steps: [
      { id: 'step_1', recipeId: 'recipe_death_guard', order: 1, instruction: 'Basecoat with Death Guard Green', paintId: 'citadel_death_guard_green', technique: 'Base Coat' },
      { id: 'step_2', recipeId: 'recipe_death_guard', order: 2, instruction: 'Shade with Agrax Earthshade', paintId: 'citadel_agrax_earthshade', technique: 'Shade' },
      { id: 'step_3', recipeId: 'recipe_death_guard', order: 3, instruction: 'Apply Typhus Corrosion to recesses', paintId: 'citadel_typhus_corrosion', technique: 'Technical' },
      { id: 'step_4', recipeId: 'recipe_death_guard', order: 4, instruction: 'Highlight with Ogryn Camo', paintId: 'citadel_ogryn_camo', technique: 'Layer' },
      { id: 'step_5', recipeId: 'recipe_death_guard', order: 5, instruction: 'Edge highlight with Screaming Skull', paintId: 'citadel_screaming_skull', technique: 'Edge Highlight' },
    ],
  },
  {
    id: 'recipe_tau_ochre',
    authorName: 'Games Workshop',
    name: "T'au Sept Ochre Armour",
    difficulty: 'intermediate',
    timeMinutes: 55,
    previewColorHex: '#bf6e1d',
    rating: 4.5,
    ratingCount: 540,
    tags: ['Tau', 'Ochre', 'Armour', 'Orange'],
    createdAt: '2024-03-15',
    updatedAt: '2024-03-15',
    steps: [
      { id: 'step_1', recipeId: 'recipe_tau_ochre', order: 1, instruction: 'Basecoat with XV-88', paintId: 'citadel_xv88', technique: 'Base Coat' },
      { id: 'step_2', recipeId: 'recipe_tau_ochre', order: 2, instruction: 'Shade with Agrax Earthshade', paintId: 'citadel_agrax_earthshade', technique: 'Shade' },
      { id: 'step_3', recipeId: 'recipe_tau_ochre', order: 3, instruction: 'Layer with Tau Light Ochre', paintId: 'citadel_tau_light_ochre', technique: 'Layer' },
      { id: 'step_4', recipeId: 'recipe_tau_ochre', order: 4, instruction: 'Edge highlight with Ungor Flesh', paintId: 'citadel_ungor_flesh', technique: 'Edge Highlight' },
      { id: 'step_5', recipeId: 'recipe_tau_ochre', order: 5, instruction: 'Fine highlight with Screaming Skull', paintId: 'citadel_screaming_skull', technique: 'Edge Highlight' },
    ],
  },
  {
    id: 'recipe_black_templar',
    authorName: 'Games Workshop',
    name: 'Black Templars Armour',
    difficulty: 'intermediate',
    timeMinutes: 45,
    previewColorHex: '#231f20',
    rating: 4.7,
    ratingCount: 830,
    tags: ['Space Marines', 'Black Templars', 'Black', 'Armour'],
    createdAt: '2024-03-20',
    updatedAt: '2024-03-20',
    steps: [
      { id: 'step_1', recipeId: 'recipe_black_templar', order: 1, instruction: 'Basecoat with Abaddon Black', paintId: 'citadel_abaddon_black', technique: 'Base Coat' },
      { id: 'step_2', recipeId: 'recipe_black_templar', order: 2, instruction: 'Edge highlight with Eshin Grey', paintId: 'citadel_eshin_grey', technique: 'Edge Highlight' },
      { id: 'step_3', recipeId: 'recipe_black_templar', order: 3, instruction: 'Fine edge highlight with Dawnstone', paintId: 'citadel_dawnstone', technique: 'Edge Highlight' },
      { id: 'step_4', recipeId: 'recipe_black_templar', order: 4, instruction: 'Corner dot highlights with Administratum Grey', paintId: 'citadel_administratum_grey', technique: 'Highlight' },
    ],
  },
  {
    id: 'recipe_tyranid_carapace',
    authorName: 'BugHunter',
    name: 'Hive Fleet Leviathan Carapace',
    difficulty: 'intermediate',
    timeMinutes: 50,
    previewColorHex: '#440052',
    rating: 4.6,
    ratingCount: 480,
    tags: ['Tyranids', 'Purple', 'Carapace', 'Leviathan'],
    createdAt: '2024-03-25',
    updatedAt: '2024-03-25',
    steps: [
      { id: 'step_1', recipeId: 'recipe_tyranid_carapace', order: 1, instruction: 'Basecoat with Naggaroth Night', paintId: 'citadel_naggaroth_night', technique: 'Base Coat' },
      { id: 'step_2', recipeId: 'recipe_tyranid_carapace', order: 2, instruction: 'Shade with Druchii Violet', paintId: 'citadel_druchii_violet', technique: 'Shade' },
      { id: 'step_3', recipeId: 'recipe_tyranid_carapace', order: 3, instruction: 'Layer with Xereus Purple', paintId: 'citadel_xereus_purple', technique: 'Layer' },
      { id: 'step_4', recipeId: 'recipe_tyranid_carapace', order: 4, instruction: 'Highlight edges with Genestealer Purple', paintId: 'citadel_genestealer_purple', technique: 'Edge Highlight' },
      { id: 'step_5', recipeId: 'recipe_tyranid_carapace', order: 5, instruction: 'Fine highlight with Slaanesh Grey', paintId: 'citadel_slaanesh_grey', technique: 'Edge Highlight' },
    ],
  },
  {
    id: 'recipe_bone_skeleton',
    authorName: 'Games Workshop',
    name: 'Skeleton Bone',
    difficulty: 'beginner',
    timeMinutes: 30,
    previewColorHex: '#c4b89a',
    rating: 4.4,
    ratingCount: 920,
    tags: ['Undead', 'Bone', 'Skeleton', 'Quick'],
    createdAt: '2024-04-01',
    updatedAt: '2024-04-01',
    steps: [
      { id: 'step_1', recipeId: 'recipe_bone_skeleton', order: 1, instruction: 'Basecoat with Morghast Bone', paintId: 'citadel_morghast_bone', technique: 'Base Coat' },
      { id: 'step_2', recipeId: 'recipe_bone_skeleton', order: 2, instruction: 'Shade with Agrax Earthshade', paintId: 'citadel_agrax_earthshade', technique: 'Shade' },
      { id: 'step_3', recipeId: 'recipe_bone_skeleton', order: 3, instruction: 'Drybrush with Ushabti Bone', paintId: 'citadel_ushabti_bone', technique: 'Drybrush' },
      { id: 'step_4', recipeId: 'recipe_bone_skeleton', order: 4, instruction: 'Light drybrush with Screaming Skull', paintId: 'citadel_screaming_skull', technique: 'Drybrush' },
    ],
  },
  {
    id: 'recipe_retributor_gold',
    authorName: 'Games Workshop',
    name: 'Stormcast Gold Armour',
    difficulty: 'beginner',
    timeMinutes: 35,
    previewColorHex: '#c39e5e',
    rating: 4.5,
    ratingCount: 1050,
    tags: ['Stormcast', 'Gold', 'Metallic', 'Armour'],
    createdAt: '2024-04-05',
    updatedAt: '2024-04-05',
    steps: [
      { id: 'step_1', recipeId: 'recipe_retributor_gold', order: 1, instruction: 'Basecoat with Retributor Armour', paintId: 'citadel_retributor_armour', technique: 'Base Coat' },
      { id: 'step_2', recipeId: 'recipe_retributor_gold', order: 2, instruction: 'Shade with Reikland Fleshshade', paintId: 'citadel_reikland_fleshshade', technique: 'Shade' },
      { id: 'step_3', recipeId: 'recipe_retributor_gold', order: 3, instruction: 'Layer with Liberator Gold', paintId: 'citadel_liberator_gold', technique: 'Layer' },
      { id: 'step_4', recipeId: 'recipe_retributor_gold', order: 4, instruction: 'Edge highlight with Stormhost Silver', paintId: 'citadel_stormhost_silver', technique: 'Edge Highlight' },
    ],
  },
  {
    id: 'recipe_imperial_fist',
    authorName: 'YellowMaster',
    name: 'Imperial Fists Yellow',
    difficulty: 'advanced',
    timeMinutes: 90,
    previewColorHex: '#fdb825',
    rating: 4.8,
    ratingCount: 380,
    tags: ['Space Marines', 'Imperial Fists', 'Yellow', 'Armour'],
    createdAt: '2024-04-10',
    updatedAt: '2024-04-10',
    steps: [
      { id: 'step_1', recipeId: 'recipe_imperial_fist', order: 1, instruction: 'Prime with Wraithbone or Corax White', technique: 'Prime' },
      { id: 'step_2', recipeId: 'recipe_imperial_fist', order: 2, instruction: 'Basecoat with Averland Sunset', paintId: 'citadel_averland_sunset', technique: 'Base Coat' },
      { id: 'step_3', recipeId: 'recipe_imperial_fist', order: 3, instruction: 'Apply thin layers until solid coverage', paintId: 'citadel_averland_sunset', technique: 'Layer' },
      { id: 'step_4', recipeId: 'recipe_imperial_fist', order: 4, instruction: 'Shade recesses with Casandora Yellow', paintId: 'citadel_casandora_yellow', technique: 'Shade' },
      { id: 'step_5', recipeId: 'recipe_imperial_fist', order: 5, instruction: 'Highlight with Yriel Yellow', paintId: 'citadel_yriel_yellow', technique: 'Layer' },
      { id: 'step_6', recipeId: 'recipe_imperial_fist', order: 6, instruction: 'Edge highlight with Flash Gitz Yellow', paintId: 'citadel_flash_gitz_yellow', technique: 'Edge Highlight' },
    ],
  },
  {
    id: 'recipe_leather_brown',
    authorName: 'Games Workshop',
    name: 'Worn Leather',
    difficulty: 'beginner',
    timeMinutes: 25,
    previewColorHex: '#640909',
    rating: 4.3,
    ratingCount: 780,
    tags: ['Leather', 'Brown', 'General', 'Quick'],
    createdAt: '2024-04-15',
    updatedAt: '2024-04-15',
    steps: [
      { id: 'step_1', recipeId: 'recipe_leather_brown', order: 1, instruction: 'Basecoat with Mournfang Brown', paintId: 'citadel_mournfang_brown', technique: 'Base Coat' },
      { id: 'step_2', recipeId: 'recipe_leather_brown', order: 2, instruction: 'Shade with Agrax Earthshade', paintId: 'citadel_agrax_earthshade', technique: 'Shade' },
      { id: 'step_3', recipeId: 'recipe_leather_brown', order: 3, instruction: 'Highlight with Skrag Brown', technique: 'Layer' },
      { id: 'step_4', recipeId: 'recipe_leather_brown', order: 4, instruction: 'Edge highlight with Bestigor Flesh', paintId: 'citadel_bestigor_flesh', technique: 'Edge Highlight' },
    ],
  },
];

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  private readonly storage = inject(StorageService);

  private readonly recipesSignal = signal<Recipe[]>(SAMPLE_RECIPES);
  private readonly savedRecipeIds = signal<Set<string>>(this.loadSavedFromStorage());

  readonly recipes = this.recipesSignal.asReadonly();

  readonly recipesWithSaved = computed<RecipeWithSaved[]>(() => {
    const savedIds = this.savedRecipeIds();
    return this.recipesSignal().map((recipe) => ({
      ...recipe,
      saved: savedIds.has(recipe.id),
    }));
  });

  readonly savedCount = computed(
    () => this.recipesWithSaved().filter((r) => r.saved).length
  );

  readonly totalCount = computed(() => this.recipesSignal().length);

  readonly allTags = computed(() => {
    const tags = new Set<string>();
    this.recipesSignal().forEach((recipe) => {
      recipe.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  });

  constructor() {
    effect(() => {
      this.saveSavedToStorage(this.savedRecipeIds());
    });
  }

  private loadSavedFromStorage(): Set<string> {
    const data = this.storage.get<string[]>(SAVED_RECIPES_STORAGE_KEY) ?? [];
    return new Set(data);
  }

  private saveSavedToStorage(savedIds: Set<string>): void {
    this.storage.set(SAVED_RECIPES_STORAGE_KEY, Array.from(savedIds));
  }

  toggleSaved(recipeId: string): void {
    this.savedRecipeIds.update((ids) => {
      const newIds = new Set(ids);
      if (newIds.has(recipeId)) {
        newIds.delete(recipeId);
      } else {
        newIds.add(recipeId);
      }
      return newIds;
    });
  }

  getFilteredRecipes(filters: RecipeFilters): RecipeWithSaved[] {
    let result = this.recipesWithSaved();

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(searchLower) ||
          r.authorName.toLowerCase().includes(searchLower) ||
          r.tags.some((t) => t.toLowerCase().includes(searchLower))
      );
    }

    if (filters.difficulty) {
      result = result.filter((r) => r.difficulty === filters.difficulty);
    }

    if (filters.tag) {
      const tag = filters.tag;
      result = result.filter((r) => r.tags.includes(tag));
    }

    if (filters.saved) {
      result = result.filter((r) => r.saved);
    }

    return result;
  }

  getRecipeById(id: string): RecipeWithSaved | undefined {
    return this.recipesWithSaved().find((r) => r.id === id);
  }

  getDifficultyLabel(difficulty: RecipeDifficulty): string {
    const labels: Record<RecipeDifficulty, string> = {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
    };
    return labels[difficulty];
  }

  getDifficultyColor(difficulty: RecipeDifficulty): string {
    const colors: Record<RecipeDifficulty, string> = {
      beginner: 'success',
      intermediate: 'warning',
      advanced: 'danger',
    };
    return colors[difficulty];
  }

  formatTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  /**
   * Clears all user-specific saved recipe data.
   * Should be called on user logout to reset state for the next user.
   */
  clearData(): void {
    this.savedRecipeIds.set(new Set());
  }
}
