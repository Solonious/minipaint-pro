import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, tap, of, firstValueFrom, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  UserProfile,
  UserPreferences,
  ActiveSession,
  UpdateProfileDto,
  ChangePasswordDto,
  UpdatePreferencesDto,
} from '@minipaint-pro/types';

interface ApiResponse<T> {
  data: T;
}

interface MessageResponse {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // Profile signals
  private readonly profileSignal = signal<UserProfile | null>(null);
  private readonly profileLoadingSignal = signal(false);
  private readonly profileErrorSignal = signal<string | null>(null);

  // Preferences signals
  private readonly preferencesSignal = signal<UserPreferences | null>(null);
  private readonly preferencesLoadingSignal = signal(false);
  private readonly preferencesErrorSignal = signal<string | null>(null);

  // Sessions signals
  private readonly sessionsSignal = signal<ActiveSession[]>([]);
  private readonly sessionsLoadingSignal = signal(false);
  private readonly sessionsErrorSignal = signal<string | null>(null);

  // Public readonly signals
  readonly profile = this.profileSignal.asReadonly();
  readonly profileLoading = this.profileLoadingSignal.asReadonly();
  readonly profileError = this.profileErrorSignal.asReadonly();

  readonly preferences = this.preferencesSignal.asReadonly();
  readonly preferencesLoading = this.preferencesLoadingSignal.asReadonly();
  readonly preferencesError = this.preferencesErrorSignal.asReadonly();

  readonly sessions = this.sessionsSignal.asReadonly();
  readonly sessionsLoading = this.sessionsLoadingSignal.asReadonly();
  readonly sessionsError = this.sessionsErrorSignal.asReadonly();

  // ==================== Profile ====================

  loadProfile(): void {
    this.profileLoadingSignal.set(true);
    this.profileErrorSignal.set(null);

    this.http
      .get<ApiResponse<UserProfile>>(`${this.apiUrl}/settings/profile`, { withCredentials: true })
      .pipe(
        map((response) => response.data),
        tap((profile) => {
          this.profileSignal.set(profile);
          this.profileLoadingSignal.set(false);
        }),
        catchError((error) => {
          this.profileErrorSignal.set(error.error?.message || 'Failed to load profile');
          this.profileLoadingSignal.set(false);
          return of(null);
        })
      )
      .subscribe();
  }

  async updateProfile(dto: UpdateProfileDto): Promise<{ success: boolean; message: string }> {
    this.profileLoadingSignal.set(true);
    this.profileErrorSignal.set(null);

    try {
      const response = await firstValueFrom(
        this.http.patch<ApiResponse<UserProfile>>(`${this.apiUrl}/settings/profile`, dto, { withCredentials: true })
      );
      this.profileSignal.set(response.data);
      this.profileLoadingSignal.set(false);
      return { success: true, message: 'Profile updated successfully' };
    } catch (error: unknown) {
      const message = (error as { error?: { message?: string } })?.error?.message || 'Failed to update profile';
      this.profileErrorSignal.set(message);
      this.profileLoadingSignal.set(false);
      return { success: false, message };
    }
  }

  // ==================== Security ====================

  async changePassword(dto: ChangePasswordDto): Promise<{ success: boolean; message: string }> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<MessageResponse>>(`${this.apiUrl}/settings/change-password`, dto, { withCredentials: true })
      );
      return { success: true, message: response.data.message };
    } catch (error: unknown) {
      const message = (error as { error?: { message?: string } })?.error?.message || 'Failed to change password';
      return { success: false, message };
    }
  }

  loadSessions(): void {
    this.sessionsLoadingSignal.set(true);
    this.sessionsErrorSignal.set(null);

    this.http
      .get<ApiResponse<ActiveSession[]>>(`${this.apiUrl}/settings/sessions`, { withCredentials: true })
      .pipe(
        map((response) => response.data),
        tap((sessions) => {
          this.sessionsSignal.set(sessions);
          this.sessionsLoadingSignal.set(false);
        }),
        catchError((error) => {
          this.sessionsErrorSignal.set(error.error?.message || 'Failed to load sessions');
          this.sessionsLoadingSignal.set(false);
          return of(null);
        })
      )
      .subscribe();
  }

  async revokeSession(sessionId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await firstValueFrom(
        this.http.delete<ApiResponse<MessageResponse>>(`${this.apiUrl}/settings/sessions/${sessionId}`, { withCredentials: true })
      );
      // Remove session from local state
      this.sessionsSignal.update((sessions) => sessions.filter((s) => s.id !== sessionId));
      return { success: true, message: response.data.message };
    } catch (error: unknown) {
      const message = (error as { error?: { message?: string } })?.error?.message || 'Failed to revoke session';
      return { success: false, message };
    }
  }

  // ==================== Preferences ====================

  loadPreferences(): void {
    this.preferencesLoadingSignal.set(true);
    this.preferencesErrorSignal.set(null);

    this.http
      .get<ApiResponse<UserPreferences>>(`${this.apiUrl}/settings/preferences`, { withCredentials: true })
      .pipe(
        map((response) => response.data),
        tap((preferences) => {
          this.preferencesSignal.set(preferences);
          this.preferencesLoadingSignal.set(false);
        }),
        catchError((error) => {
          this.preferencesErrorSignal.set(error.error?.message || 'Failed to load preferences');
          this.preferencesLoadingSignal.set(false);
          return of(null);
        })
      )
      .subscribe();
  }

  async updatePreferences(dto: UpdatePreferencesDto): Promise<{ success: boolean; message: string }> {
    this.preferencesLoadingSignal.set(true);
    this.preferencesErrorSignal.set(null);

    try {
      const response = await firstValueFrom(
        this.http.patch<ApiResponse<UserPreferences>>(`${this.apiUrl}/settings/preferences`, dto, { withCredentials: true })
      );
      this.preferencesSignal.set(response.data);
      this.preferencesLoadingSignal.set(false);
      return { success: true, message: 'Preferences updated successfully' };
    } catch (error: unknown) {
      const message = (error as { error?: { message?: string } })?.error?.message || 'Failed to update preferences';
      this.preferencesErrorSignal.set(message);
      this.preferencesLoadingSignal.set(false);
      return { success: false, message };
    }
  }

  // ==================== Account ====================

  async deleteAccount(password: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await firstValueFrom(
        this.http.delete<ApiResponse<MessageResponse>>(`${this.apiUrl}/settings/account`, {
          body: { password },
          withCredentials: true,
        })
      );
      return { success: true, message: response.data.message };
    } catch (error: unknown) {
      const message = (error as { error?: { message?: string } })?.error?.message || 'Failed to delete account';
      return { success: false, message };
    }
  }

  // ==================== Clear Data ====================

  clearData(): void {
    this.profileSignal.set(null);
    this.preferencesSignal.set(null);
    this.sessionsSignal.set([]);
    this.profileErrorSignal.set(null);
    this.preferencesErrorSignal.set(null);
    this.sessionsErrorSignal.set(null);
  }
}
