import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Auth endpoints that should not trigger token refresh
const AUTH_ENDPOINTS = [
  '/auth/refresh',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/me',
];

function isAuthEndpoint(url: string): boolean {
  return AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);

  // Clone request with credentials
  const authReq = req.clone({
    withCredentials: true,
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 errors (unauthorized)
      // Skip token refresh for auth endpoints and when user is not yet authenticated
      if (
        error.status === 401 &&
        !isAuthEndpoint(req.url) &&
        authService.isAuthenticated()
      ) {
        // Attempt to refresh the token
        return from(authService.refreshToken()).pipe(
          switchMap((success) => {
            if (success) {
              // Retry the original request
              return next(authReq);
            } else {
              // Refresh failed, redirect to login
              return from(authService.logout()).pipe(
                switchMap(() => throwError(() => error))
              );
            }
          }),
          catchError(() => {
            // If refresh fails, logout and throw original error
            return from(authService.logout()).pipe(
              switchMap(() => throwError(() => error))
            );
          })
        );
      }

      return throwError(() => error);
    })
  );
};
