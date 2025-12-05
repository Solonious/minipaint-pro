import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  template: '<router-outlet />',
  styles: [':host { display: block; }'],
})
export class AppComponent {}
