import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import {
  MiniatureWithLibrary,
  MiniatureImage,
  MiniatureTutorial,
  ColorScheme,
  CreateMiniatureImageDto,
  CreateMiniatureTutorialDto,
  CreateColorSchemeDto,
  UpdateMiniatureImageDto,
  UpdateMiniatureTutorialDto,
  GameSystem,
} from '@minipaint-pro/types';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> {
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class MiniatureLibraryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly currentMiniatureSignal = signal<MiniatureWithLibrary | null>(null);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly currentMiniature = this.currentMiniatureSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly images = computed(() => this.currentMiniatureSignal()?.images ?? []);
  readonly colorScheme = computed(() => this.currentMiniatureSignal()?.colorScheme ?? null);
  readonly tutorials = computed(() => this.currentMiniatureSignal()?.tutorials ?? []);

  // Load miniature with all library data
  loadMiniatureWithLibrary(id: string): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.http
      .get<ApiResponse<MiniatureWithLibrary>>(`${this.apiUrl}/miniatures/${id}/library`)
      .pipe(
        map((response) => response.data),
        tap((miniature) => {
          this.currentMiniatureSignal.set(this.mapFromApi(miniature));
          this.loadingSignal.set(false);
        }),
        catchError((error) => {
          console.error('Error loading miniature library:', error);
          this.errorSignal.set('Failed to load miniature');
          this.loadingSignal.set(false);
          return of(null);
        })
      )
      .subscribe();
  }

  // Image operations
  uploadImage(miniatureId: string, file: File, dto: Partial<CreateMiniatureImageDto>): Observable<MiniatureImage> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('miniatureId', miniatureId);
    if (dto.caption) formData.append('caption', dto.caption);
    if (dto.imageType) formData.append('imageType', dto.imageType.toUpperCase());
    if (dto.order !== undefined) formData.append('order', String(dto.order));

    return this.http
      .post<ApiResponse<MiniatureImage>>(`${this.apiUrl}/miniature-images/upload`, formData)
      .pipe(
        map((response) => this.mapImageFromApi(response.data)),
        tap((image) => {
          const current = this.currentMiniatureSignal();
          if (current) {
            this.currentMiniatureSignal.set({
              ...current,
              images: [...current.images, image],
            });
          }
        })
      );
  }

  // Add image via external URL (no file upload)
  addImageByUrl(dto: CreateMiniatureImageDto): Observable<MiniatureImage> {
    const payload = {
      ...dto,
      imageType: dto.imageType ? dto.imageType.toUpperCase() : 'REFERENCE',
    };

    return this.http
      .post<ApiResponse<MiniatureImage>>(`${this.apiUrl}/miniature-images`, payload)
      .pipe(
        map((response) => this.mapImageFromApi(response.data)),
        tap((image) => {
          const current = this.currentMiniatureSignal();
          if (current) {
            this.currentMiniatureSignal.set({
              ...current,
              images: [...current.images, image],
            });
          }
        })
      );
  }

  updateImage(id: string, dto: UpdateMiniatureImageDto): void {
    this.http
      .patch<ApiResponse<MiniatureImage>>(`${this.apiUrl}/miniature-images/${id}`, this.mapImageToApi(dto))
      .pipe(
        map((response) => this.mapImageFromApi(response.data)),
        tap((updatedImage) => {
          const current = this.currentMiniatureSignal();
          if (current) {
            this.currentMiniatureSignal.set({
              ...current,
              images: current.images.map((img) => (img.id === id ? updatedImage : img)),
            });
          }
        }),
        catchError((error) => {
          console.error('Error updating image:', error);
          return of(null);
        })
      )
      .subscribe();
  }

  deleteImage(id: string): void {
    this.http
      .delete(`${this.apiUrl}/miniature-images/${id}`)
      .pipe(
        tap(() => {
          const current = this.currentMiniatureSignal();
          if (current) {
            this.currentMiniatureSignal.set({
              ...current,
              images: current.images.filter((img) => img.id !== id),
            });
          }
        }),
        catchError((error) => {
          console.error('Error deleting image:', error);
          return of(null);
        })
      )
      .subscribe();
  }

  reorderImages(miniatureId: string, imageIds: string[]): void {
    this.http
      .post<ApiResponse<MiniatureImage[]>>(`${this.apiUrl}/miniature-images/reorder`, {
        miniatureId,
        imageIds,
      })
      .pipe(
        map((response) => response.data.map((img) => this.mapImageFromApi(img))),
        tap((images) => {
          const current = this.currentMiniatureSignal();
          if (current) {
            this.currentMiniatureSignal.set({ ...current, images });
          }
        }),
        catchError((error) => {
          console.error('Error reordering images:', error);
          return of([]);
        })
      )
      .subscribe();
  }

  // Tutorial operations
  addTutorial(dto: CreateMiniatureTutorialDto): void {
    this.http
      .post<ApiResponse<MiniatureTutorial>>(`${this.apiUrl}/tutorials`, this.mapTutorialToApi(dto))
      .pipe(
        map((response) => this.mapTutorialFromApi(response.data)),
        tap((tutorial) => {
          const current = this.currentMiniatureSignal();
          if (current) {
            this.currentMiniatureSignal.set({
              ...current,
              tutorials: [...current.tutorials, tutorial],
            });
          }
        }),
        catchError((error) => {
          console.error('Error adding tutorial:', error);
          return of(null);
        })
      )
      .subscribe();
  }

  updateTutorial(id: string, dto: UpdateMiniatureTutorialDto): void {
    this.http
      .patch<ApiResponse<MiniatureTutorial>>(`${this.apiUrl}/tutorials/${id}`, this.mapTutorialToApi(dto))
      .pipe(
        map((response) => this.mapTutorialFromApi(response.data)),
        tap((updatedTutorial) => {
          const current = this.currentMiniatureSignal();
          if (current) {
            this.currentMiniatureSignal.set({
              ...current,
              tutorials: current.tutorials.map((t) => (t.id === id ? updatedTutorial : t)),
            });
          }
        }),
        catchError((error) => {
          console.error('Error updating tutorial:', error);
          return of(null);
        })
      )
      .subscribe();
  }

  deleteTutorial(id: string): void {
    this.http
      .delete(`${this.apiUrl}/tutorials/${id}`)
      .pipe(
        tap(() => {
          const current = this.currentMiniatureSignal();
          if (current) {
            this.currentMiniatureSignal.set({
              ...current,
              tutorials: current.tutorials.filter((t) => t.id !== id),
            });
          }
        }),
        catchError((error) => {
          console.error('Error deleting tutorial:', error);
          return of(null);
        })
      )
      .subscribe();
  }

  // Color scheme operations
  saveColorScheme(dto: CreateColorSchemeDto): void {
    this.http
      .post<ApiResponse<ColorScheme>>(`${this.apiUrl}/color-schemes`, dto)
      .pipe(
        map((response) => response.data),
        tap((colorScheme) => {
          const current = this.currentMiniatureSignal();
          if (current) {
            this.currentMiniatureSignal.set({ ...current, colorScheme });
          }
        }),
        catchError((error) => {
          console.error('Error saving color scheme:', error);
          return of(null);
        })
      )
      .subscribe();
  }

  deleteColorScheme(id: string): void {
    this.http
      .delete(`${this.apiUrl}/color-schemes/${id}`)
      .pipe(
        tap(() => {
          const current = this.currentMiniatureSignal();
          if (current) {
            this.currentMiniatureSignal.set({ ...current, colorScheme: undefined });
          }
        }),
        catchError((error) => {
          console.error('Error deleting color scheme:', error);
          return of(null);
        })
      )
      .subscribe();
  }

  // Helper to get image URL
  getImageUrl(filename: string | null | undefined): string {
    if (!filename) return '';
    return `${this.apiUrl}/miniature-images/file/${filename}`;
  }

  // Helper to get proxied external URL
  getProxiedImageUrl(externalUrl: string): string {
    return `${this.apiUrl}/miniature-images/proxy?url=${encodeURIComponent(externalUrl)}`;
  }

  // Clear current miniature
  clear(): void {
    this.currentMiniatureSignal.set(null);
    this.errorSignal.set(null);
  }

  // Mapping helpers
  private mapFromApi(miniature: MiniatureWithLibrary): MiniatureWithLibrary {
    return {
      ...miniature,
      status: this.mapStatusFromApi(miniature.status),
      gameSystem: miniature.gameSystem ? this.mapGameSystemFromApi(miniature.gameSystem) : undefined,
      images: miniature.images.map((img) => this.mapImageFromApi(img)),
      tutorials: miniature.tutorials.map((t) => this.mapTutorialFromApi(t)),
    };
  }

  private mapImageFromApi(image: MiniatureImage): MiniatureImage {
    return {
      ...image,
      imageType: this.mapImageTypeFromApi(image.imageType),
    };
  }

  private mapImageToApi(dto: UpdateMiniatureImageDto): Record<string, unknown> {
    return {
      ...dto,
      imageType: dto.imageType ? dto.imageType.toUpperCase() : undefined,
    };
  }

  private mapTutorialFromApi(tutorial: MiniatureTutorial): MiniatureTutorial {
    return {
      ...tutorial,
      platform: this.mapPlatformFromApi(tutorial.platform),
    };
  }

  private mapTutorialToApi(dto: CreateMiniatureTutorialDto | UpdateMiniatureTutorialDto): Record<string, unknown> {
    return {
      ...dto,
      platform: dto.platform ? dto.platform.toUpperCase() : undefined,
    };
  }

  private mapStatusFromApi(status: string): 'unbuilt' | 'assembled' | 'primed' | 'wip' | 'painted' | 'complete' {
    const statusMap: Record<string, 'unbuilt' | 'assembled' | 'primed' | 'wip' | 'painted' | 'complete'> = {
      UNBUILT: 'unbuilt',
      ASSEMBLED: 'assembled',
      PRIMED: 'primed',
      WIP: 'wip',
      PAINTED: 'painted',
      COMPLETE: 'complete',
    };
    return statusMap[status] || 'unbuilt';
  }

  private mapGameSystemFromApi(gameSystem: string): GameSystem {
    return gameSystem as GameSystem;
  }

  private mapImageTypeFromApi(imageType: string): 'reference' | 'wip' | 'completed' | 'detail' {
    const typeMap: Record<string, 'reference' | 'wip' | 'completed' | 'detail'> = {
      REFERENCE: 'reference',
      WIP: 'wip',
      COMPLETED: 'completed',
      DETAIL: 'detail',
    };
    return typeMap[imageType] || 'reference';
  }

  private mapPlatformFromApi(platform: string): 'youtube' | 'vimeo' | 'custom' {
    const platformMap: Record<string, 'youtube' | 'vimeo' | 'custom'> = {
      YOUTUBE: 'youtube',
      VIMEO: 'vimeo',
      CUSTOM: 'custom',
    };
    return platformMap[platform] || 'youtube';
  }
}
