import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';

export const appRoutes: Routes = [
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
        loadComponent: () =>
          import('./features/admin/admin.component').then(
            (m) => m.AdminComponent
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'pile',
  },
];
