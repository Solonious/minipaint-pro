import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for auth to initialize
  if (!authService.initialized()) {
    return new Promise((resolve) => {
      const checkInitialized = setInterval(() => {
        if (authService.initialized()) {
          clearInterval(checkInitialized);
          if (authService.isAdmin()) {
            resolve(true);
          } else if (authService.isAuthenticated()) {
            // Authenticated but not admin - redirect to home
            resolve(router.createUrlTree(['/']));
          } else {
            // Not authenticated - redirect to login
            resolve(router.createUrlTree(['/auth/login']));
          }
        }
      }, 50);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInitialized);
        resolve(router.createUrlTree(['/auth/login']));
      }, 5000);
    });
  }

  if (authService.isAdmin()) {
    return true;
  }

  if (authService.isAuthenticated()) {
    // Authenticated but not admin - redirect to home
    return router.createUrlTree(['/']);
  }

  // Not authenticated - redirect to login
  return router.createUrlTree(['/auth/login']);
};
