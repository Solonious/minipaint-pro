import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

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
      // Exclude only refresh and login endpoints to avoid infinite loops
      if (
        error.status === 401 &&
        !req.url.includes('/auth/refresh') &&
        !req.url.includes('/auth/login')
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
