import { Injectable, computed, effect, inject, signal } from '@angular/core';
import {
  Army,
  ArmyWithProgress,
  CreateArmyDto,
  UpdateArmyDto,
} from '@minipaint-pro/types';
import { StorageService } from './storage.service';
import { MiniatureService } from './miniature.service';

const STORAGE_KEY = 'minipaint_armies';

@Injectable({
  providedIn: 'root',
})
export class ArmyService {
  private readonly storage = inject(StorageService);
  private readonly miniatureService = inject(MiniatureService);

  private readonly armiesSignal = signal<Army[]>(this.loadFromStorage());

  readonly armies = this.armiesSignal.asReadonly();

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
    effect(() => {
      this.saveToStorage(this.armiesSignal());
    });
  }

  private loadFromStorage(): Army[] {
    return this.storage.get<Army[]>(STORAGE_KEY) ?? [];
  }

  private saveToStorage(armies: Army[]): void {
    this.storage.set(STORAGE_KEY, armies);
  }

  private generateId(): string {
    return `army_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  add(dto: CreateArmyDto): Army {
    const now = new Date().toISOString();
    const army: Army = {
      id: this.generateId(),
      name: dto.name,
      faction: dto.faction,
      gameSystem: dto.gameSystem,
      targetPoints: dto.targetPoints,
      iconEmoji: dto.iconEmoji,
      colorHex: dto.colorHex,
      createdAt: now,
      updatedAt: now,
    };

    this.armiesSignal.update((armies) => [...armies, army]);
    return army;
  }

  update(id: string, dto: UpdateArmyDto): Army | null {
    let updated: Army | null = null;

    this.armiesSignal.update((armies) =>
      armies.map((a) => {
        if (a.id === id) {
          updated = {
            ...a,
            ...dto,
            updatedAt: new Date().toISOString(),
          };
          return updated;
        }
        return a;
      })
    );

    return updated;
  }

  delete(id: string): void {
    this.armiesSignal.update((armies) => armies.filter((a) => a.id !== id));
  }

  getById(id: string): Army | undefined {
    return this.armiesSignal().find((a) => a.id === id);
  }
}
