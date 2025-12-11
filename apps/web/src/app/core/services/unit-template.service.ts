import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import {
  CreateUnitTemplateDto,
  GameSystem,
  UnitTemplate,
} from '@minipaint-pro/types';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> {
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class UnitTemplateService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/unit-templates`;

  private readonly templatesSignal = signal<UnitTemplate[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly templates = this.templatesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly sortedByUsage = computed(() => {
    return [...this.templatesSignal()].sort((a, b) => {
      if (b.usageCount !== a.usageCount) {
        return b.usageCount - a.usageCount;
      }
      return a.name.localeCompare(b.name);
    });
  });

  constructor() {
    this.loadAll();
  }

  loadAll(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.http
      .get<ApiResponse<UnitTemplate[]>>(this.apiUrl)
      .pipe(
        map((response) => response.data),
        tap((templates) => {
          this.templatesSignal.set(this.mapFromApi(templates));
          this.loadingSignal.set(false);
        }),
        catchError((error) => {
          console.error('Error loading unit templates:', error);
          this.errorSignal.set('Failed to load unit templates');
          this.loadingSignal.set(false);
          return of([]);
        })
      )
      .subscribe();
  }

  search(query: string, gameSystem?: GameSystem): Observable<UnitTemplate[]> {
    const params: Record<string, string> = { q: query };
    if (gameSystem) {
      params['gameSystem'] = this.mapGameSystemToApi(gameSystem);
    }

    return this.http
      .get<ApiResponse<UnitTemplate[]>>(`${this.apiUrl}/search`, { params })
      .pipe(
        map((response) => this.mapFromApi(response.data)),
        catchError((error) => {
          console.error('Error searching unit templates:', error);
          return of([]);
        })
      );
  }

  findOrCreate(dto: CreateUnitTemplateDto): Observable<UnitTemplate> {
    const apiDto = this.mapToApi(dto);

    return this.http
      .post<ApiResponse<UnitTemplate>>(`${this.apiUrl}/find-or-create`, apiDto)
      .pipe(
        map((response) => this.mapSingleFromApi(response.data)),
        tap((template) => {
          this.templatesSignal.update((templates) => {
            const exists = templates.some((t) => t.id === template.id);
            if (exists) {
              return templates.map((t) => (t.id === template.id ? template : t));
            }
            return [...templates, template];
          });
        }),
        catchError((error) => {
          console.error('Error creating unit template:', error);
          throw error;
        })
      );
  }

  incrementUsage(id: string): void {
    this.http
      .post<ApiResponse<UnitTemplate>>(`${this.apiUrl}/${id}/increment-usage`, {})
      .pipe(
        map((response) => response.data),
        tap((template) => {
          const mapped = this.mapSingleFromApi(template);
          this.templatesSignal.update((templates) =>
            templates.map((t) => (t.id === id ? mapped : t))
          );
        }),
        catchError((error) => {
          console.error('Error incrementing usage:', error);
          return of(null);
        })
      )
      .subscribe();
  }

  getById(id: string): UnitTemplate | undefined {
    return this.templatesSignal().find((t) => t.id === id);
  }

  getByGameSystem(gameSystem: GameSystem): UnitTemplate[] {
    return this.templatesSignal().filter((t) => t.gameSystem === gameSystem);
  }

  private mapFromApi(templates: UnitTemplate[]): UnitTemplate[] {
    return templates.map((t) => this.mapSingleFromApi(t));
  }

  private mapSingleFromApi(template: UnitTemplate): UnitTemplate {
    return {
      ...template,
      gameSystem: this.mapGameSystemFromApi(template.gameSystem as unknown as string),
    };
  }

  private mapToApi(dto: CreateUnitTemplateDto): Record<string, unknown> {
    const result: Record<string, unknown> = { ...dto };

    if (dto.gameSystem) {
      result['gameSystem'] = this.mapGameSystemToApi(dto.gameSystem);
    }

    return result;
  }

  private mapGameSystemFromApi(gameSystem: string): GameSystem {
    return gameSystem as GameSystem;
  }

  private mapGameSystemToApi(gameSystem: GameSystem): string {
    return gameSystem;
  }
}
