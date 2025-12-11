import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of, tap } from 'rxjs';
import {
  CreateMiniatureDto,
  GameSystem,
  Miniature,
  MiniatureFilters,
  MiniatureStatus,
  MiniatureTag,
  ModelStageCounts,
  MoveModelsDto,
  UnbuiltState,
  UpdateMiniatureDto,
  WipStage,
  createDefaultStageCounts,
} from '@minipaint-pro/types';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> {
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class MiniatureService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/miniatures`;

  private readonly miniaturesSignal = signal<Miniature[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly loadedSignal = signal<boolean>(false);

  readonly miniatures = this.miniaturesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly loaded = this.loadedSignal.asReadonly();

  readonly miniaturesByStatus = computed(() => {
    const minis = this.miniaturesSignal();
    const grouped: Record<MiniatureStatus, Miniature[]> = {
      unbuilt: [],
      assembled: [],
      primed: [],
      wip: [],
      painted: [],
      complete: [],
    };

    for (const mini of minis) {
      grouped[mini.status].push(mini);
    }

    return grouped;
  });

  readonly totalCount = computed(() => this.miniaturesSignal().length);

  readonly totalPoints = computed(() =>
    this.miniaturesSignal().reduce((sum, m) => sum + m.points, 0)
  );

  readonly completedCount = computed(
    () => this.miniaturesSignal().filter((m) => m.status === 'complete').length
  );

  loadAll(): void {
    if (this.loadedSignal() || this.loadingSignal()) {
      return;
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.http
      .get<ApiResponse<Miniature[]>>(this.apiUrl)
      .pipe(
        map((response) => response.data),
        tap((miniatures) => {
          this.miniaturesSignal.set(this.mapFromApi(miniatures));
          this.loadingSignal.set(false);
          this.loadedSignal.set(true);
        }),
        catchError((error) => {
          console.error('Error loading miniatures:', error);
          this.errorSignal.set('Failed to load miniatures');
          this.loadingSignal.set(false);
          return of([]);
        })
      )
      .subscribe();
  }

  add(dto: CreateMiniatureDto): void {
    const apiDto = this.mapToApi(dto);

    this.http
      .post<ApiResponse<Miniature>>(this.apiUrl, apiDto)
      .pipe(
        map((response) => response.data),
        tap((miniature) => {
          const mapped = this.mapSingleFromApi(miniature);
          this.miniaturesSignal.update((minis) => [...minis, mapped]);
        }),
        catchError((error) => {
          console.error('Error creating miniature:', error);
          this.errorSignal.set('Failed to create miniature');
          return of(null);
        })
      )
      .subscribe();
  }

  update(id: string, dto: UpdateMiniatureDto): void {
    const apiDto = this.mapToApi(dto);

    this.http
      .patch<ApiResponse<Miniature>>(`${this.apiUrl}/${id}`, apiDto)
      .pipe(
        map((response) => response.data),
        tap((miniature) => {
          const mapped = this.mapSingleFromApi(miniature);
          this.miniaturesSignal.update((minis) =>
            minis.map((m) => (m.id === id ? mapped : m))
          );
        }),
        catchError((error) => {
          console.error('Error updating miniature:', error);
          this.errorSignal.set('Failed to update miniature');
          return of(null);
        })
      )
      .subscribe();
  }

  updateStatus(id: string, status: MiniatureStatus): void {
    const apiStatus = this.mapStatusToApi(status);

    this.http
      .patch<ApiResponse<Miniature>>(`${this.apiUrl}/${id}/status`, { status: apiStatus })
      .pipe(
        map((response) => response.data),
        tap((miniature) => {
          const mapped = this.mapSingleFromApi(miniature);
          this.miniaturesSignal.update((minis) =>
            minis.map((m) => (m.id === id ? mapped : m))
          );
        }),
        catchError((error) => {
          console.error('Error updating miniature status:', error);
          this.errorSignal.set('Failed to update status');
          return of(null);
        })
      )
      .subscribe();
  }

  delete(id: string): void {
    this.http
      .delete<ApiResponse<Miniature>>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          this.miniaturesSignal.update((minis) =>
            minis.filter((m) => m.id !== id)
          );
        }),
        catchError((error) => {
          console.error('Error deleting miniature:', error);
          this.errorSignal.set('Failed to delete miniature');
          return of(null);
        })
      )
      .subscribe();
  }

  incrementCompleted(id: string): void {
    this.http
      .post<ApiResponse<Miniature>>(`${this.apiUrl}/${id}/increment-completed`, {})
      .pipe(
        map((response) => response.data),
        tap((miniature) => {
          const mapped = this.mapSingleFromApi(miniature);
          this.miniaturesSignal.update((minis) =>
            minis.map((m) => (m.id === id ? mapped : m))
          );
        }),
        catchError((error) => {
          console.error('Error incrementing completed:', error);
          this.errorSignal.set('Failed to update progress');
          return of(null);
        })
      )
      .subscribe();
  }

  decrementCompleted(id: string): void {
    this.http
      .post<ApiResponse<Miniature>>(`${this.apiUrl}/${id}/decrement-completed`, {})
      .pipe(
        map((response) => response.data),
        tap((miniature) => {
          const mapped = this.mapSingleFromApi(miniature);
          this.miniaturesSignal.update((minis) =>
            minis.map((m) => (m.id === id ? mapped : m))
          );
        }),
        catchError((error) => {
          console.error('Error decrementing completed:', error);
          this.errorSignal.set('Failed to update progress');
          return of(null);
        })
      )
      .subscribe();
  }

  moveModels(id: string, fromStage: MiniatureStatus, toStage: MiniatureStatus, count: number = 1): void {
    const dto: MoveModelsDto = {
      fromStage,
      toStage,
      count,
    };

    this.http
      .post<ApiResponse<Miniature>>(`${this.apiUrl}/${id}/move-models`, this.mapMoveModelsToApi(dto))
      .pipe(
        map((response) => response.data),
        tap((miniature) => {
          const mapped = this.mapSingleFromApi(miniature);
          this.miniaturesSignal.update((minis) =>
            minis.map((m) => (m.id === id ? mapped : m))
          );
        }),
        catchError((error) => {
          console.error('Error moving models:', error);
          this.errorSignal.set('Failed to move models');
          return of(null);
        })
      )
      .subscribe();
  }

  getById(id: string): Miniature | undefined {
    return this.miniaturesSignal().find((m) => m.id === id);
  }

  getByArmyId(armyId: string): Miniature[] {
    return this.miniaturesSignal().filter((m) => m.armyId === armyId);
  }

  getFilteredMiniatures(filters: MiniatureFilters): Miniature[] {
    let result = this.miniaturesSignal();

    // Text search (name or faction)
    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.faction.toLowerCase().includes(query)
      );
    }

    // Game system filter
    if (filters.gameSystem) {
      result = result.filter((m) => m.gameSystem === filters.gameSystem);
    }

    // Faction filter
    if (filters.faction) {
      result = result.filter((m) => m.faction === filters.faction);
    }

    // Army filter
    if (filters.armyId) {
      result = result.filter((m) => m.armyId === filters.armyId);
    }

    return result;
  }

  getUniqueFactions(): string[] {
    const factions = this.miniaturesSignal().map((m) => m.faction);
    return [...new Set(factions)].sort();
  }

  private mapFromApi(miniatures: Miniature[]): Miniature[] {
    return miniatures.map((m) => this.mapSingleFromApi(m));
  }

  private mapSingleFromApi(miniature: Miniature): Miniature {
    const status = this.mapStatusFromApi(miniature.status);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawStageCounts = (miniature as any).stageCounts;

    return {
      ...miniature,
      status,
      gameSystem: miniature.gameSystem
        ? this.mapGameSystemFromApi(miniature.gameSystem)
        : undefined,
      stageCounts: rawStageCounts
        ? this.mapStageCountsFromApi(rawStageCounts)
        : createDefaultStageCounts(miniature.modelCount, status),
      unbuiltState: miniature.unbuiltState
        ? this.mapUnbuiltStateFromApi(miniature.unbuiltState)
        : undefined,
      wipStage: miniature.wipStage
        ? this.mapWipStageFromApi(miniature.wipStage)
        : undefined,
      tags: miniature.tags
        ? this.mapTagsFromApi(miniature.tags)
        : [],
    };
  }

  private mapToApi(
    dto: CreateMiniatureDto | UpdateMiniatureDto
  ): Record<string, unknown> {
    const result: Record<string, unknown> = { ...dto };

    if (dto.status) {
      result['status'] = this.mapStatusToApi(dto.status);
    }

    if (dto.gameSystem) {
      result['gameSystem'] = this.mapGameSystemToApi(dto.gameSystem);
    }

    if (dto.unbuiltState) {
      result['unbuiltState'] = this.mapUnbuiltStateToApi(dto.unbuiltState);
    }

    if (dto.wipStage) {
      result['wipStage'] = this.mapWipStageToApi(dto.wipStage);
    }

    if (dto.tags && dto.tags.length > 0) {
      result['tags'] = this.mapTagsToApi(dto.tags);
    }

    return result;
  }

  private mapStatusFromApi(status: string): MiniatureStatus {
    const mapping: Record<string, MiniatureStatus> = {
      UNBUILT: 'unbuilt',
      ASSEMBLED: 'assembled',
      PRIMED: 'primed',
      WIP: 'wip',
      PAINTED: 'painted',
      COMPLETE: 'complete',
    };
    return mapping[status] || 'unbuilt';
  }

  private mapStatusToApi(status: MiniatureStatus): string {
    const mapping: Record<MiniatureStatus, string> = {
      unbuilt: 'UNBUILT',
      assembled: 'ASSEMBLED',
      primed: 'PRIMED',
      wip: 'WIP',
      painted: 'PAINTED',
      complete: 'COMPLETE',
    };
    return mapping[status];
  }

  private mapGameSystemFromApi(gameSystem: string): GameSystem {
    const mapping: Record<string, GameSystem> = {
      WARHAMMER_40K: 'warhammer40k',
      AGE_OF_SIGMAR: 'ageOfSigmar',
      KILL_TEAM: 'killTeam',
      NECROMUNDA: 'necromunda',
      HORUS_HERESY: 'horusHeresy',
      OTHER: 'other',
    };
    return mapping[gameSystem] || 'other';
  }

  private mapGameSystemToApi(gameSystem: string): string {
    const mapping: Record<string, string> = {
      warhammer40k: 'WARHAMMER_40K',
      ageOfSigmar: 'AGE_OF_SIGMAR',
      killTeam: 'KILL_TEAM',
      necromunda: 'NECROMUNDA',
      horusHeresy: 'HORUS_HERESY',
      other: 'OTHER',
    };
    return mapping[gameSystem] || 'OTHER';
  }

  private mapStageCountsFromApi(stageCounts: Record<string, number>): ModelStageCounts {
    return {
      unbuilt: stageCounts['unbuilt'] ?? 0,
      assembled: stageCounts['assembled'] ?? 0,
      primed: stageCounts['primed'] ?? 0,
      wip: stageCounts['wip'] ?? 0,
      painted: stageCounts['painted'] ?? 0,
      complete: stageCounts['complete'] ?? 0,
    };
  }

  private mapUnbuiltStateFromApi(state: string): UnbuiltState {
    const mapping: Record<string, UnbuiltState> = {
      INBOX: 'inbox',
      ON_SPRUE: 'on_sprue',
      CLIPPED: 'clipped',
      READY: 'ready',
    };
    return mapping[state] || 'inbox';
  }

  private mapUnbuiltStateToApi(state: UnbuiltState): string {
    const mapping: Record<UnbuiltState, string> = {
      inbox: 'INBOX',
      on_sprue: 'ON_SPRUE',
      clipped: 'CLIPPED',
      ready: 'READY',
    };
    return mapping[state];
  }

  private mapWipStageFromApi(stage: string): WipStage {
    const mapping: Record<string, WipStage> = {
      BASE_COATED: 'base_coated',
      BLOCKING: 'blocking',
      LAYERING: 'layering',
      WASHING: 'washing',
      HIGHLIGHTING: 'highlighting',
      DETAILING: 'detailing',
      BASING: 'basing',
    };
    return mapping[stage] || 'base_coated';
  }

  private mapWipStageToApi(stage: WipStage): string {
    const mapping: Record<WipStage, string> = {
      base_coated: 'BASE_COATED',
      blocking: 'BLOCKING',
      layering: 'LAYERING',
      washing: 'WASHING',
      highlighting: 'HIGHLIGHTING',
      detailing: 'DETAILING',
      basing: 'BASING',
    };
    return mapping[stage];
  }

  private mapTagsFromApi(tags: string[]): MiniatureTag[] {
    const mapping: Record<string, MiniatureTag> = {
      MAGNETIZED: 'magnetized',
      PINNED: 'pinned',
      SUB_ASSEMBLIES: 'sub_assemblies',
      BASED: 'based',
      CONTRAST_METHOD: 'contrast_method',
      VARNISHED: 'varnished',
      DECALS_APPLIED: 'decals_applied',
      DISPLAY_QUALITY: 'display_quality',
      TABLETOP_READY: 'tabletop_ready',
    };
    return tags.map((t) => mapping[t] || 'magnetized').filter(Boolean);
  }

  private mapTagsToApi(tags: MiniatureTag[]): string[] {
    const mapping: Record<MiniatureTag, string> = {
      magnetized: 'MAGNETIZED',
      pinned: 'PINNED',
      sub_assemblies: 'SUB_ASSEMBLIES',
      based: 'BASED',
      contrast_method: 'CONTRAST_METHOD',
      varnished: 'VARNISHED',
      decals_applied: 'DECALS_APPLIED',
      display_quality: 'DISPLAY_QUALITY',
      tabletop_ready: 'TABLETOP_READY',
    };
    return tags.map((t) => mapping[t]);
  }

  private mapMoveModelsToApi(dto: MoveModelsDto): Record<string, unknown> {
    return {
      fromStage: this.mapStatusToApi(dto.fromStage),
      toStage: this.mapStatusToApi(dto.toStage),
      count: dto.count,
    };
  }

  /**
   * Clears all miniature data.
   * Should be called on user logout to reset state for the next user.
   */
  clearData(): void {
    this.miniaturesSignal.set([]);
    this.errorSignal.set(null);
    this.loadedSignal.set(false);
  }
}
