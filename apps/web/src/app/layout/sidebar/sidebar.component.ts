import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ButtonModule, TooltipModule, RippleModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  expanded = input(true);
  toggleSidebar = output<void>();

  navItems: NavItem[] = [
    { label: 'Pile of Shame', icon: 'pi pi-th-large', route: '/pile' },
    { label: 'Armies', icon: 'pi pi-users', route: '/armies' },
    { label: 'Paints', icon: 'pi pi-palette', route: '/paints' },
    { label: 'Recipes', icon: 'pi pi-book', route: '/recipes' },
    { label: 'Progress', icon: 'pi pi-chart-line', route: '/progress' },
  ];

  onToggle(): void {
    this.toggleSidebar.emit();
  }
}
