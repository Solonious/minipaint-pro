import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';
import {
  CreateMiniatureDto,
  GameSystem,
  Miniature,
  MiniatureStatus,
  UpdateMiniatureDto,
} from '@minipaint-pro/types';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MiniatureService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/miniatures`;

  private readonly miniaturesSignal = signal<Miniature[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly miniatures = this.miniaturesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

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

  constructor() {
    this.loadAll();
  }

  loadAll(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.http
      .get<Miniature[]>(this.apiUrl)
      .pipe(
        tap((miniatures) => {
          this.miniaturesSignal.set(this.mapFromApi(miniatures));
          this.loadingSignal.set(false);
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
      .post<Miniature>(this.apiUrl, apiDto)
      .pipe(
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
      .patch<Miniature>(`${this.apiUrl}/${id}`, apiDto)
      .pipe(
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
      .patch<Miniature>(`${this.apiUrl}/${id}/status`, { status: apiStatus })
      .pipe(
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
      .delete<Miniature>(`${this.apiUrl}/${id}`)
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

  getById(id: string): Miniature | undefined {
    return this.miniaturesSignal().find((m) => m.id === id);
  }

  getByArmyId(armyId: string): Miniature[] {
    return this.miniaturesSignal().filter((m) => m.armyId === armyId);
  }

  private mapFromApi(miniatures: Miniature[]): Miniature[] {
    return miniatures.map((m) => this.mapSingleFromApi(m));
  }

  private mapSingleFromApi(miniature: Miniature): Miniature {
    return {
      ...miniature,
      status: this.mapStatusFromApi(miniature.status),
      gameSystem: miniature.gameSystem
        ? this.mapGameSystemFromApi(miniature.gameSystem)
        : undefined,
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
}
