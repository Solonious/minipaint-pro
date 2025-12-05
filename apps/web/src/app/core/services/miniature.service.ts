import { Injectable, computed, effect, inject, signal } from '@angular/core';
import {
  CreateMiniatureDto,
  Miniature,
  MiniatureStatus,
  UpdateMiniatureDto,
} from '@minipaint-pro/types';
import { StorageService } from './storage.service';

const STORAGE_KEY = 'minipaint_miniatures';

@Injectable({
  providedIn: 'root',
})
export class MiniatureService {
  private readonly storage = inject(StorageService);

  private readonly miniaturesSignal = signal<Miniature[]>(this.loadFromStorage());

  readonly miniatures = this.miniaturesSignal.asReadonly();

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
    effect(() => {
      this.saveToStorage(this.miniaturesSignal());
    });
  }

  private loadFromStorage(): Miniature[] {
    return this.storage.get<Miniature[]>(STORAGE_KEY) ?? [];
  }

  private saveToStorage(miniatures: Miniature[]): void {
    this.storage.set(STORAGE_KEY, miniatures);
  }

  private generateId(): string {
    return `mini_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  add(dto: CreateMiniatureDto): Miniature {
    const now = new Date().toISOString();
    const miniature: Miniature = {
      id: this.generateId(),
      name: dto.name,
      faction: dto.faction,
      armyId: dto.armyId,
      points: dto.points,
      modelCount: dto.modelCount ?? 1,
      status: dto.status ?? 'unbuilt',
      cost: dto.cost,
      notes: dto.notes,
      imageUrl: dto.imageUrl,
      createdAt: now,
      updatedAt: now,
    };

    this.miniaturesSignal.update((minis) => [...minis, miniature]);
    return miniature;
  }

  update(id: string, dto: UpdateMiniatureDto): Miniature | null {
    let updated: Miniature | null = null;

    this.miniaturesSignal.update((minis) =>
      minis.map((m) => {
        if (m.id === id) {
          updated = {
            ...m,
            ...dto,
            updatedAt: new Date().toISOString(),
          };
          return updated;
        }
        return m;
      })
    );

    return updated;
  }

  updateStatus(id: string, status: MiniatureStatus): void {
    this.update(id, { status });
  }

  delete(id: string): void {
    this.miniaturesSignal.update((minis) => minis.filter((m) => m.id !== id));
  }

  getById(id: string): Miniature | undefined {
    return this.miniaturesSignal().find((m) => m.id === id);
  }

  getByArmyId(armyId: string): Miniature[] {
    return this.miniaturesSignal().filter((m) => m.armyId === armyId);
  }
}
