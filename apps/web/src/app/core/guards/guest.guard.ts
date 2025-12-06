import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for auth to initialize
  if (!authService.initialized()) {
    return new Promise((resolve) => {
      const checkInitialized = setInterval(() => {
        if (authService.initialized()) {
          clearInterval(checkInitialized);
          if (authService.isAuthenticated()) {
            // Already authenticated - redirect to home
            resolve(router.createUrlTree(['/']));
          } else {
            resolve(true);
          }
        }
      }, 50);

      // Timeout after 5 seconds - allow access
      setTimeout(() => {
        clearInterval(checkInitialized);
        resolve(true);
      }, 5000);
    });
  }

  if (authService.isAuthenticated()) {
    // Already authenticated - redirect to home
    return router.createUrlTree(['/']);
  }

  return true;
};
