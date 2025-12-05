import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { RippleModule } from 'primeng/ripple';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RippleModule],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.scss',
})
export class BottomNavComponent {
  navItems: NavItem[] = [
    { label: 'Pile', icon: 'pi pi-th-large', route: '/pile' },
    { label: 'Armies', icon: 'pi pi-users', route: '/armies' },
    { label: 'Paints', icon: 'pi pi-palette', route: '/paints' },
    { label: 'Recipes', icon: 'pi pi-book', route: '/recipes' },
    { label: 'Progress', icon: 'pi pi-chart-line', route: '/progress' },
  ];
}
