import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';
import { GameSystem } from '@minipaint-pro/types';
import { StorageService } from './storage.service';

export interface WahapediaFaction {
  id: string;
  name: string;
  link: string;
}

export interface WahapediaUnit {
  id: string;
  name: string;
  factionId: string;
  role: string;
  link: string;
}

interface CachedData<T> {
  data: T;
  timestamp: number;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const FACTIONS_CACHE_KEY = 'wahapedia_factions';
const UNITS_CACHE_KEY = 'wahapedia_units';

const GAME_SYSTEM_TO_WAHAPEDIA: Record<string, string> = {
  warhammer40k: 'wh40k10ed',
  killTeam: 'kill-team',
  ageOfSigmar: 'aos3',
  horusHeresy: 'horus-heresy',
  necromunda: 'necromunda',
};

@Injectable({
  providedIn: 'root',
})
export class WahapediaService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);

  private readonly factionsSignal = signal<WahapediaFaction[]>([]);
  private readonly unitsSignal = signal<WahapediaUnit[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly factions = this.factionsSignal.asReadonly();
  readonly units = this.unitsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly unitsByFaction = computed(() => {
    const units = this.unitsSignal();
    const grouped = new Map<string, WahapediaUnit[]>();

    units.forEach((unit) => {
      const existing = grouped.get(unit.factionId) || [];
      existing.push(unit);
      grouped.set(unit.factionId, existing);
    });

    return grouped;
  });

  loadData(gameSystem: GameSystem): void {
    const wahapediaEdition = GAME_SYSTEM_TO_WAHAPEDIA[gameSystem];
    if (!wahapediaEdition || wahapediaEdition !== 'wh40k10ed') {
      this.factionsSignal.set([]);
      this.unitsSignal.set([]);
      return;
    }

    const cachedFactions = this.getCachedData<WahapediaFaction[]>(
      `${FACTIONS_CACHE_KEY}_${gameSystem}`
    );
    const cachedUnits = this.getCachedData<WahapediaUnit[]>(
      `${UNITS_CACHE_KEY}_${gameSystem}`
    );

    if (cachedFactions && cachedUnits) {
      this.factionsSignal.set(cachedFactions);
      this.unitsSignal.set(cachedUnits);
      return;
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.fetchFactions(wahapediaEdition).subscribe({
      next: (factions) => {
        this.factionsSignal.set(factions);
        this.setCachedData(`${FACTIONS_CACHE_KEY}_${gameSystem}`, factions);
      },
      error: (err) => {
        this.errorSignal.set('Failed to load factions');
        this.loadingSignal.set(false);
        console.error('Error loading factions:', err);
      },
    });

    this.fetchUnits(wahapediaEdition).subscribe({
      next: (units) => {
        this.unitsSignal.set(units);
        this.setCachedData(`${UNITS_CACHE_KEY}_${gameSystem}`, units);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set('Failed to load units');
        this.loadingSignal.set(false);
        console.error('Error loading units:', err);
      },
    });
  }

  getUnitsForFaction(factionId: string): WahapediaUnit[] {
    return this.unitsByFaction().get(factionId) || [];
  }

  getFactionById(factionId: string): WahapediaFaction | undefined {
    return this.factionsSignal().find((f) => f.id === factionId);
  }

  getUnitById(unitId: string): WahapediaUnit | undefined {
    return this.unitsSignal().find((u) => u.id === unitId);
  }

  private fetchFactions(edition: string) {
    const url = `https://wahapedia.ru/${edition}/Factions.csv`;

    return this.http.get(url, { responseType: 'text' }).pipe(
      map((csv) => this.parseFactionsCsv(csv)),
      catchError((error) => {
        console.error('Error fetching factions:', error);
        return of([]);
      })
    );
  }

  private fetchUnits(edition: string) {
    const url = `https://wahapedia.ru/${edition}/Datasheets.csv`;

    return this.http.get(url, { responseType: 'text' }).pipe(
      map((csv) => this.parseUnitsCsv(csv)),
      catchError((error) => {
        console.error('Error fetching units:', error);
        return of([]);
      })
    );
  }

  private parseFactionsCsv(csv: string): WahapediaFaction[] {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return [];

    return lines.slice(1).map((line) => {
      const [id, name, link] = line.split('|');
      return {
        id: id?.trim() || '',
        name: name?.trim() || '',
        link: link?.trim() || '',
      };
    }).filter((f) => f.id && f.name);
  }

  private parseUnitsCsv(csv: string): WahapediaUnit[] {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return [];

    return lines.slice(1).map((line) => {
      const parts = line.split('|');
      return {
        id: parts[0]?.trim() || '',
        name: parts[1]?.trim() || '',
        factionId: parts[2]?.trim() || '',
        role: parts[5]?.trim() || '',
        link: parts[13]?.trim() || '',
      };
    }).filter((u) => u.id && u.name && u.factionId && !u.name.includes('virtual'));
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.storage.get<CachedData<T>>(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      this.storage.remove(key);
      return null;
    }

    return cached.data;
  }

  private setCachedData<T>(key: string, data: T): void {
    const cached: CachedData<T> = {
      data,
      timestamp: Date.now(),
    };
    this.storage.set(key, cached);
  }
}
