import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { GameSystem } from '@minipaint-pro/types';

export interface UnitImage {
  id: string;
  gameSystem: string;
  faction: string;
  unitName: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  source: 'MANUAL' | 'WARHAMMER_COMMUNITY' | 'GAMES_WORKSHOP';
  sourceUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UnitImageResponse {
  imageUrl: string | null;
  source?: string;
}

export interface ImageStats {
  totalImages: number;
  byGameSystem: Record<string, number>;
  bySource: Record<string, number>;
}

interface ApiResponse<T> {
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly imagesSignal = signal<UnitImage[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly statsSignal = signal<ImageStats | null>(null);

  readonly images = this.imagesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly stats = this.statsSignal.asReadonly();

  readonly imagesByFaction = computed(() => {
    const images = this.imagesSignal();
    const grouped: Record<string, UnitImage[]> = {};

    for (const img of images) {
      const key = `${img.gameSystem}|${img.faction}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(img);
    }

    return grouped;
  });

  loadImages(gameSystem?: string, faction?: string): void {
    this.loadingSignal.set(true);

    let url = `${this.apiUrl}/admin/images`;
    const params: string[] = [];
    if (gameSystem) params.push(`gameSystem=${gameSystem}`);
    if (faction) params.push(`faction=${encodeURIComponent(faction)}`);
    if (params.length) url += `?${params.join('&')}`;

    this.http.get<ApiResponse<UnitImage[]>>(url).subscribe({
      next: (response) => {
        this.imagesSignal.set(response.data);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        console.error('Failed to load images:', err);
        this.loadingSignal.set(false);
      },
    });
  }

  loadStats(): void {
    this.http.get<ApiResponse<ImageStats>>(`${this.apiUrl}/admin/images/stats`).subscribe({
      next: (response) => this.statsSignal.set(response.data),
      error: (err) => console.error('Failed to load stats:', err),
    });
  }

  uploadImage(
    file: File,
    gameSystem: string,
    faction: string,
    unitName: string
  ): Promise<UnitImage> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('gameSystem', gameSystem);
    formData.append('faction', faction);
    formData.append('unitName', unitName);

    return new Promise((resolve, reject) => {
      this.http.post<ApiResponse<UnitImage>>(`${this.apiUrl}/admin/images/upload`, formData).subscribe({
        next: (response) => {
          this.loadImages();
          this.loadStats();
          resolve(response.data);
        },
        error: reject,
      });
    });
  }

  importImage(
    gameSystem: string,
    faction: string,
    unitName: string,
    sourceUrl: string,
    source?: 'WARHAMMER_COMMUNITY' | 'GAMES_WORKSHOP'
  ): Promise<UnitImage> {
    return new Promise((resolve, reject) => {
      this.http
        .post<ApiResponse<UnitImage>>(`${this.apiUrl}/admin/images/import`, {
          gameSystem,
          faction,
          unitName,
          sourceUrl,
          source,
        })
        .subscribe({
          next: (response) => {
            this.loadImages();
            this.loadStats();
            resolve(response.data);
          },
          error: reject,
        });
    });
  }

  deleteImage(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.delete(`${this.apiUrl}/admin/images/${id}`).subscribe({
        next: () => {
          this.imagesSignal.update((images) => images.filter((img) => img.id !== id));
          this.loadStats();
          resolve();
        },
        error: reject,
      });
    });
  }

  getUnitImageUrl(gameSystem: string, faction: string, unitName: string): Promise<string | null> {
    const params = new URLSearchParams({
      gameSystem,
      faction,
      unitName,
    });

    return new Promise((resolve) => {
      this.http
        .get<ApiResponse<UnitImageResponse>>(`${this.apiUrl}/unit-images?${params}`)
        .subscribe({
          next: (response) => resolve(response.data.imageUrl),
          error: () => resolve(null),
        });
    });
  }

  getImageUrl(filename: string): string {
    return `${this.apiUrl}/uploads/units/${filename}`;
  }
}
