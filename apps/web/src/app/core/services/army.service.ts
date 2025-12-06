import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of, tap } from 'rxjs';
import {
  Army,
  ArmyWithProgress,
  CreateArmyDto,
  GameSystem,
  UpdateArmyDto,
} from '@minipaint-pro/types';
import { MiniatureService } from './miniature.service';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> {
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class ArmyService {
  private readonly http = inject(HttpClient);
  private readonly miniatureService = inject(MiniatureService);
  private readonly apiUrl = `${environment.apiUrl}/armies`;

  private readonly armiesSignal = signal<Army[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly armies = this.armiesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly armiesWithProgress = computed<ArmyWithProgress[]>(() => {
    const armies = this.armiesSignal();
    const miniatures = this.miniatureService.miniatures();

    return armies.map((army) => {
      const armyMinis = miniatures.filter((m) => m.armyId === army.id);
      const completedMinis = armyMinis.filter((m) => m.status === 'complete');
      const currentPoints = completedMinis.reduce((sum, m) => sum + m.points, 0);

      return {
        ...army,
        miniatureCount: armyMinis.length,
        completedCount: completedMinis.length,
        currentPoints,
        progressPercentage:
          army.targetPoints > 0
            ? Math.min(100, Math.round((currentPoints / army.targetPoints) * 100))
            : 0,
      };
    });
  });

  constructor() {
    this.loadAll();
  }

  loadAll(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.http
      .get<ApiResponse<Army[]>>(this.apiUrl)
      .pipe(
        map((response) => response.data),
        tap((armies) => {
          this.armiesSignal.set(this.mapFromApi(armies));
          this.loadingSignal.set(false);
        }),
        catchError((error) => {
          console.error('Error loading armies:', error);
          this.errorSignal.set('Failed to load armies');
          this.loadingSignal.set(false);
          return of([]);
        })
      )
      .subscribe();
  }

  add(dto: CreateArmyDto): void {
    const apiDto = this.mapToApi(dto);

    this.http
      .post<ApiResponse<Army>>(this.apiUrl, apiDto)
      .pipe(
        map((response) => response.data),
        tap((army) => {
          const mapped = this.mapSingleFromApi(army);
          this.armiesSignal.update((armies) => [...armies, mapped]);
        }),
        catchError((error) => {
          console.error('Error creating army:', error);
          this.errorSignal.set('Failed to create army');
          return of(null);
        })
      )
      .subscribe();
  }

  update(id: string, dto: UpdateArmyDto): void {
    const apiDto = this.mapToApi(dto);

    this.http
      .patch<ApiResponse<Army>>(`${this.apiUrl}/${id}`, apiDto)
      .pipe(
        map((response) => response.data),
        tap((army) => {
          const mapped = this.mapSingleFromApi(army);
          this.armiesSignal.update((armies) =>
            armies.map((a) => (a.id === id ? mapped : a))
          );
        }),
        catchError((error) => {
          console.error('Error updating army:', error);
          this.errorSignal.set('Failed to update army');
          return of(null);
        })
      )
      .subscribe();
  }

  delete(id: string): void {
    this.http
      .delete<ApiResponse<Army>>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          this.armiesSignal.update((armies) => armies.filter((a) => a.id !== id));
        }),
        catchError((error) => {
          console.error('Error deleting army:', error);
          this.errorSignal.set('Failed to delete army');
          return of(null);
        })
      )
      .subscribe();
  }

  getById(id: string): Army | undefined {
    return this.armiesSignal().find((a) => a.id === id);
  }

  private mapFromApi(armies: Army[]): Army[] {
    return armies.map((a) => this.mapSingleFromApi(a));
  }

  private mapSingleFromApi(army: Army): Army {
    return {
      ...army,
      gameSystem: this.mapGameSystemFromApi(army.gameSystem),
    };
  }

  private mapToApi(
    dto: CreateArmyDto | UpdateArmyDto
  ): Record<string, unknown> {
    const result: Record<string, unknown> = { ...dto };

    if (dto.gameSystem) {
      result['gameSystem'] = this.mapGameSystemToApi(dto.gameSystem);
    }

    return result;
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

  private mapGameSystemToApi(gameSystem: GameSystem): string {
    const mapping: Record<GameSystem, string> = {
      warhammer40k: 'WARHAMMER_40K',
      ageOfSigmar: 'AGE_OF_SIGMAR',
      killTeam: 'KILL_TEAM',
      necromunda: 'NECROMUNDA',
      horusHeresy: 'HORUS_HERESY',
      other: 'OTHER',
    };
    return mapping[gameSystem];
  }
}
