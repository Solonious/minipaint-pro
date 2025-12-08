import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { adminGuard } from './core/guards/admin.guard';
import { guestGuard } from './core/guards/guest.guard';

export const appRoutes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(
            (m) => m.LoginComponent
          ),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then(
            (m) => m.RegisterComponent
          ),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent
          ),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./features/auth/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent
          ),
      },
      {
        path: 'verify-email',
        loadComponent: () =>
          import('./features/auth/verify-email/verify-email.component').then(
            (m) => m.VerifyEmailComponent
          ),
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: '',
        redirectTo: 'pile',
        pathMatch: 'full',
      },
      {
        path: 'pile',
        loadComponent: () =>
          import('./features/pile-of-shame/pile-of-shame.component').then(
            (m) => m.PileOfShameComponent
          ),
      },
      {
        path: 'pile/:id',
        loadComponent: () =>
          import('./features/pile-of-shame/unit-detail/unit-detail.component').then(
            (m) => m.UnitDetailComponent
          ),
      },
      {
        path: 'armies',
        loadComponent: () =>
          import('./features/army-dashboard/army-dashboard.component').then(
            (m) => m.ArmyDashboardComponent
          ),
      },
      {
        path: 'paints',
        loadComponent: () =>
          import('./features/paint-collection/paint-collection.component').then(
            (m) => m.PaintCollectionComponent
          ),
      },
      {
        path: 'recipes',
        loadComponent: () =>
          import('./features/recipes/recipes.component').then(
            (m) => m.RecipesComponent
          ),
      },
      {
        path: 'progress',
        loadComponent: () =>
          import('./features/progress/progress.component').then(
            (m) => m.ProgressComponent
          ),
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/admin.component').then(
            (m) => m.AdminComponent
          ),
      },
      {
        path: 'library-admin',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/library-admin/library-admin.component').then(
            (m) => m.LibraryAdminComponent
          ),
      },
      {
        path: 'library',
        loadComponent: () =>
          import('./features/miniature-library/miniature-library.component').then(
            (m) => m.MiniatureLibraryComponent
          ),
      },
      {
        path: 'library/:id',
        loadComponent: () =>
          import('./features/miniature-library/miniature-detail/miniature-detail.component').then(
            (m) => m.MiniatureDetailComponent
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'pile',
  },
];
