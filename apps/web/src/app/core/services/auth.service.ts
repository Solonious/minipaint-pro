import { Injectable, Injector, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, tap, of, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthUser,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponse,
  MeResponse,
} from '@minipaint-pro/types';
import { StorageService } from './storage.service';
import { MiniatureService } from './miniature.service';
import { ArmyService } from './army.service';
import { PaintService } from './paint.service';
import { ProgressService } from './progress.service';
import { RecipeService } from './recipe.service';

// Storage keys for user-specific data that need to be cleared on logout
const USER_STORAGE_KEYS = [
  'minipaint_paint_ownership',
  'minipaint_progress',
  'minipaint_goals',
  'minipaint_saved_recipes',
] as const;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly storage = inject(StorageService);
  private readonly injector = inject(Injector);
  private readonly apiUrl = environment.apiUrl;

  // Signals for state management
  private readonly userSignal = signal<AuthUser | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly initializedSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  // Public readonly signals
  readonly user = this.userSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly initialized = this.initializedSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  // Computed signals
  readonly isAuthenticated = computed(() => this.userSignal() !== null);
  readonly isAdmin = computed(() => this.userSignal()?.role === 'ADMIN');
  readonly isEmailVerified = computed(() => this.userSignal()?.emailVerified ?? false);

  // Subject for refresh token in progress
  private refreshing$ = new BehaviorSubject<boolean>(false);
  readonly isRefreshing$ = this.refreshing$.asObservable();

  // Promise that resolves when initial auth check completes
  private initPromiseResolve: (() => void) | null = null;
  private readonly initPromise = new Promise<void>((resolve) => {
    this.initPromiseResolve = resolve;
  });

  constructor() {
    // Check authentication status after a microtask to avoid circular dependency
    // The interceptor injects AuthService, so we can't make HTTP calls during construction
    Promise.resolve().then(() => this.checkAuth());
  }

  /**
   * Returns a Promise that resolves when the initial authentication check completes.
   * Use this for APP_INITIALIZER or to wait before rendering the app.
   */
  waitForInitialization(): Promise<void> {
    return this.initPromise;
  }

  checkAuth(): Promise<boolean> {
    this.loadingSignal.set(true);

    return new Promise((resolve) => {
      this.http
        .get<MeResponse>(`${this.apiUrl}/auth/me`, { withCredentials: true })
        .subscribe({
          next: (response) => {
            this.userSignal.set(response.data);
            this.loadingSignal.set(false);
            this.initializedSignal.set(true);
            this.resolveInitPromise();
            resolve(true);
          },
          error: () => {
            // This is called after interceptor retries have failed
            this.userSignal.set(null);
            this.loadingSignal.set(false);
            this.initializedSignal.set(true);
            this.resolveInitPromise();
            resolve(false);
          },
        });
    });
  }

  private resolveInitPromise(): void {
    if (this.initPromiseResolve) {
      this.initPromiseResolve();
      this.initPromiseResolve = null;
    }
  }

  async login(credentials: LoginRequest): Promise<boolean> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve) => {
      this.http
        .post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials, {
          withCredentials: true,
        })
        .pipe(
          tap(async () => {
            // Fetch user data after successful login and wait for it to complete
            await this.checkAuth();
            resolve(true);
          }),
          catchError((error) => {
            this.loadingSignal.set(false);
            this.errorSignal.set(
              error.error?.message || 'Login failed. Please try again.'
            );
            resolve(false);
            return of(null);
          })
        )
        .subscribe();
    });
  }

  register(data: RegisterRequest): Promise<{ success: boolean; message: string }> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve) => {
      this.http
        .post<AuthResponse>(`${this.apiUrl}/auth/register`, data, {
          withCredentials: true,
        })
        .pipe(
          tap((response) => {
            this.loadingSignal.set(false);
            resolve({ success: true, message: response.message });
          }),
          catchError((error) => {
            this.loadingSignal.set(false);
            const message =
              error.error?.message || 'Registration failed. Please try again.';
            this.errorSignal.set(message);
            resolve({ success: false, message });
            return of(null);
          })
        )
        .subscribe();
    });
  }

  logout(): Promise<void> {
    return new Promise((resolve) => {
      this.http
        .post<AuthResponse>(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true })
        .pipe(
          tap(() => {
            this.clearUserContext();
            this.router.navigate(['/auth/login']);
            resolve();
          }),
          catchError(() => {
            this.clearUserContext();
            this.router.navigate(['/auth/login']);
            resolve();
            return of(null);
          })
        )
        .subscribe();
    });
  }

  logoutAll(): Promise<void> {
    return new Promise((resolve) => {
      this.http
        .post<AuthResponse>(`${this.apiUrl}/auth/logout-all`, {}, { withCredentials: true })
        .pipe(
          tap(() => {
            this.clearUserContext();
            this.router.navigate(['/auth/login']);
            resolve();
          }),
          catchError(() => {
            this.clearUserContext();
            this.router.navigate(['/auth/login']);
            resolve();
            return of(null);
          })
        )
        .subscribe();
    });
  }

  forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve) => {
      const request: ForgotPasswordRequest = { email };
      this.http
        .post<AuthResponse>(`${this.apiUrl}/auth/forgot-password`, request, {
          withCredentials: true,
        })
        .pipe(
          tap((response) => {
            this.loadingSignal.set(false);
            resolve({ success: true, message: response.message });
          }),
          catchError((error) => {
            this.loadingSignal.set(false);
            const message =
              error.error?.message || 'Failed to send reset email.';
            this.errorSignal.set(message);
            resolve({ success: false, message });
            return of(null);
          })
        )
        .subscribe();
    });
  }

  resetPassword(data: ResetPasswordRequest): Promise<{ success: boolean; message: string }> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve) => {
      this.http
        .post<AuthResponse>(`${this.apiUrl}/auth/reset-password`, data, {
          withCredentials: true,
        })
        .pipe(
          tap((response) => {
            this.loadingSignal.set(false);
            resolve({ success: true, message: response.message });
          }),
          catchError((error) => {
            this.loadingSignal.set(false);
            const message =
              error.error?.message || 'Failed to reset password.';
            this.errorSignal.set(message);
            resolve({ success: false, message });
            return of(null);
          })
        )
        .subscribe();
    });
  }

  verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve) => {
      this.http
        .post<AuthResponse>(
          `${this.apiUrl}/auth/verify-email`,
          { token },
          { withCredentials: true }
        )
        .pipe(
          tap((response) => {
            this.loadingSignal.set(false);
            resolve({ success: true, message: response.message });
          }),
          catchError((error) => {
            this.loadingSignal.set(false);
            const message =
              error.error?.message || 'Failed to verify email.';
            this.errorSignal.set(message);
            resolve({ success: false, message });
            return of(null);
          })
        )
        .subscribe();
    });
  }

  resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
    this.loadingSignal.set(true);

    return new Promise((resolve) => {
      this.http
        .post<AuthResponse>(
          `${this.apiUrl}/auth/resend-verification`,
          { email },
          { withCredentials: true }
        )
        .pipe(
          tap((response) => {
            this.loadingSignal.set(false);
            resolve({ success: true, message: response.message });
          }),
          catchError((error) => {
            this.loadingSignal.set(false);
            const message =
              error.error?.message || 'Failed to resend verification email.';
            resolve({ success: false, message });
            return of(null);
          })
        )
        .subscribe();
    });
  }

  refreshToken(): Promise<boolean> {
    if (this.refreshing$.value) {
      return new Promise((resolve) => {
        const subscription = this.refreshing$.subscribe((refreshing) => {
          if (!refreshing) {
            subscription.unsubscribe();
            resolve(this.isAuthenticated());
          }
        });
      });
    }

    this.refreshing$.next(true);

    return new Promise((resolve) => {
      this.http
        .post<AuthResponse>(`${this.apiUrl}/auth/refresh`, {}, { withCredentials: true })
        .pipe(
          tap(() => {
            this.refreshing$.next(false);
            resolve(true);
          }),
          catchError(() => {
            this.userSignal.set(null);
            this.refreshing$.next(false);
            resolve(false);
            return of(null);
          })
        )
        .subscribe();
    });
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  /**
   * Clears all user-specific context on logout.
   * This includes:
   * - User signal state
   * - All user-specific localStorage data (paint ownership, progress, goals, saved recipes)
   * - All service signals containing user data
   */
  private clearUserContext(): void {
    // Clear user signal
    this.userSignal.set(null);

    // Clear all user-specific localStorage data
    for (const key of USER_STORAGE_KEYS) {
      this.storage.remove(key);
    }

    // Clear all service signals using lazy injection to avoid circular dependencies
    // These services are retrieved lazily to prevent issues during initialization
    this.injector.get(MiniatureService).clearData();
    this.injector.get(ArmyService).clearData();
    this.injector.get(PaintService).clearData();
    this.injector.get(ProgressService).clearData();
    this.injector.get(RecipeService).clearData();
  }
}
