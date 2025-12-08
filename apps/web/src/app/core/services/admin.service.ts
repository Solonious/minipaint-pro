import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  AdminUser,
  AdminUserListQuery,
  AdminUserListResponse,
  UpdateUserRequest,
} from '@minipaint-pro/types';

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

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminCount: number;
  verifiedUsers: number;
  recentSignups: number;
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

  // ============================================
  // User Management
  // ============================================

  private readonly usersSignal = signal<AdminUser[]>([]);
  private readonly usersTotalSignal = signal(0);
  private readonly usersLoadingSignal = signal(false);
  private readonly userStatsSignal = signal<UserStats | null>(null);
  private readonly usersPageSignal = signal(1);
  private readonly usersPageSizeSignal = signal(10);

  readonly users = this.usersSignal.asReadonly();
  readonly usersTotal = this.usersTotalSignal.asReadonly();
  readonly usersLoading = this.usersLoadingSignal.asReadonly();
  readonly userStats = this.userStatsSignal.asReadonly();
  readonly usersPage = this.usersPageSignal.asReadonly();
  readonly usersPageSize = this.usersPageSizeSignal.asReadonly();

  loadUsers(query: AdminUserListQuery = {}): void {
    this.usersLoadingSignal.set(true);

    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page.toString());
    if (query.pageSize) params = params.set('pageSize', query.pageSize.toString());
    if (query.search) params = params.set('search', query.search);
    if (query.role) params = params.set('role', query.role);
    if (query.isActive !== undefined) params = params.set('isActive', query.isActive.toString());
    if (query.emailVerified !== undefined) params = params.set('emailVerified', query.emailVerified.toString());
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.sortOrder) params = params.set('sortOrder', query.sortOrder);

    this.http.get<AdminUserListResponse>(`${this.apiUrl}/admin/users`, { params }).subscribe({
      next: (response) => {
        this.usersSignal.set(response.data);
        this.usersTotalSignal.set(response.total);
        this.usersPageSignal.set(response.page);
        this.usersPageSizeSignal.set(response.pageSize);
        this.usersLoadingSignal.set(false);
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.usersLoadingSignal.set(false);
      },
    });
  }

  loadUserStats(): void {
    this.http.get<ApiResponse<UserStats>>(`${this.apiUrl}/admin/users/stats`).subscribe({
      next: (response) => this.userStatsSignal.set(response.data),
      error: (err) => console.error('Failed to load user stats:', err),
    });
  }

  getUser(id: string): Promise<AdminUser> {
    return new Promise((resolve, reject) => {
      this.http.get<ApiResponse<AdminUser>>(`${this.apiUrl}/admin/users/${id}`).subscribe({
        next: (response) => resolve(response.data),
        error: reject,
      });
    });
  }

  updateUser(id: string, data: UpdateUserRequest): Promise<AdminUser> {
    return new Promise((resolve, reject) => {
      this.http.patch<ApiResponse<AdminUser>>(`${this.apiUrl}/admin/users/${id}`, data).subscribe({
        next: (response) => {
          // Update local state
          this.usersSignal.update((users) =>
            users.map((u) => (u.id === id ? response.data : u))
          );
          this.loadUserStats();
          resolve(response.data);
        },
        error: reject,
      });
    });
  }

  deactivateUser(id: string): Promise<AdminUser> {
    return new Promise((resolve, reject) => {
      this.http.delete<ApiResponse<AdminUser>>(`${this.apiUrl}/admin/users/${id}`).subscribe({
        next: (response) => {
          // Update local state
          this.usersSignal.update((users) =>
            users.map((u) => (u.id === id ? response.data : u))
          );
          this.loadUserStats();
          resolve(response.data);
        },
        error: reject,
      });
    });
  }

  forcePasswordReset(id: string): Promise<{ message: string }> {
    return new Promise((resolve, reject) => {
      this.http
        .post<{ message: string }>(`${this.apiUrl}/admin/users/${id}/force-password-reset`, {})
        .subscribe({
          next: (response) => resolve(response),
          error: reject,
        });
    });
  }
}
