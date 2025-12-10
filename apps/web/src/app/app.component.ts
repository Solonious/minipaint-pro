import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { AppLoaderComponent } from './shared/components/app-loader/app-loader.component';

@Component({
  imports: [RouterModule, AppLoaderComponent],
  selector: 'app-root',
  template: `
    @if (!authService.initialized()) {
      <app-loader />
    } @else {
      <router-outlet />
    }
  `,
  styles: [':host { display: block; }'],
})
export class AppComponent {
  protected readonly authService = inject(AuthService);
}
