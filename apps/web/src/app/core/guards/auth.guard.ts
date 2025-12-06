import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for auth to initialize
  if (!authService.initialized()) {
    // Return a promise that resolves when initialized
    return new Promise((resolve) => {
      const checkInitialized = setInterval(() => {
        if (authService.initialized()) {
          clearInterval(checkInitialized);
          if (authService.isAuthenticated()) {
            resolve(true);
          } else {
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

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/auth/login']);
};
