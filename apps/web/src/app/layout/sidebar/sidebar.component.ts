import { Component, input, output, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ButtonModule, TooltipModule, RippleModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  readonly authService = inject(AuthService);

  expanded = input(true);
  toggleSidebar = output<void>();

  private readonly allNavItems: NavItem[] = [
    { label: 'Pile of Shame', icon: 'pi pi-th-large', route: '/pile' },
    { label: 'Library', icon: 'pi pi-images', route: '/library' },
    { label: 'Armies', icon: 'pi pi-users', route: '/armies' },
    { label: 'Paints', icon: 'pi pi-palette', route: '/paints' },
    { label: 'Recipes', icon: 'pi pi-book', route: '/recipes' },
    { label: 'Progress', icon: 'pi pi-chart-line', route: '/progress' },
    { label: 'Unit Images', icon: 'pi pi-image', route: '/admin', adminOnly: true },
    { label: 'Library Admin', icon: 'pi pi-cog', route: '/library-admin', adminOnly: true },
  ];

  readonly regularNavItems = computed(() => {
    return this.allNavItems.filter(item => !item.adminOnly);
  });

  readonly adminNavItems = computed(() => {
    if (!this.authService.isAdmin()) return [];
    return this.allNavItems.filter(item => item.adminOnly);
  });

  onToggle(): void {
    this.toggleSidebar.emit();
  }

  async onLogout(): Promise<void> {
    await this.authService.logout();
  }
}
