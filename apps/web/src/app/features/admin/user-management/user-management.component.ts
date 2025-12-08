import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AdminService, UserStats } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { AdminUser, UserRole, UpdateUserRequest } from '@minipaint-pro/types';

interface RoleOption {
  label: string;
  value: UserRole;
}

interface StatusOption {
  label: string;
  value: boolean | undefined;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    SelectModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    CheckboxModule,
    ProgressSpinnerModule,
    TooltipModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserManagementComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  // Data signals from service
  readonly users = this.adminService.users;
  readonly usersTotal = this.adminService.usersTotal;
  readonly loading = this.adminService.usersLoading;
  readonly stats = this.adminService.userStats;
  readonly currentUser = this.authService.user;

  // Local state
  readonly searchTerm = signal('');
  readonly roleFilter = signal<UserRole | undefined>(undefined);
  readonly activeFilter = signal<boolean | undefined>(undefined);
  readonly verifiedFilter = signal<boolean | undefined>(undefined);
  readonly sortField = signal<string>('createdAt');
  readonly sortOrder = signal<number>(-1);
  readonly first = signal(0);
  readonly rows = signal(10);

  // Edit dialog state
  readonly showEditDialog = signal(false);
  readonly editingUser = signal<AdminUser | null>(null);
  readonly editForm = signal<UpdateUserRequest>({});
  readonly saving = signal(false);

  // Dropdown options
  readonly roleOptions: RoleOption[] = [
    { label: 'User', value: 'USER' },
    { label: 'Admin', value: 'ADMIN' },
  ];

  readonly statusOptions: StatusOption[] = [
    { label: 'All', value: undefined },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ];

  readonly verifiedOptions: StatusOption[] = [
    { label: 'All', value: undefined },
    { label: 'Verified', value: true },
    { label: 'Not Verified', value: false },
  ];

  // Computed
  readonly isCurrentUser = computed(() => {
    const editing = this.editingUser();
    const current = this.currentUser();
    return editing?.id === current?.id;
  });

  ngOnInit(): void {
    this.loadUsers();
    this.adminService.loadUserStats();
  }

  loadUsers(): void {
    const sortBy = this.mapSortField(this.sortField());
    const sortOrder = this.sortOrder() === 1 ? 'asc' : 'desc';

    this.adminService.loadUsers({
      page: Math.floor(this.first() / this.rows()) + 1,
      pageSize: this.rows(),
      search: this.searchTerm() || undefined,
      role: this.roleFilter(),
      isActive: this.activeFilter(),
      emailVerified: this.verifiedFilter(),
      sortBy: sortBy as 'email' | 'displayName' | 'createdAt' | 'lastLoginAt' | 'role',
      sortOrder,
    });
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 10);

    if (event.sortField) {
      this.sortField.set(event.sortField as string);
      this.sortOrder.set(event.sortOrder ?? -1);
    }

    this.loadUsers();
  }

  onSearch(): void {
    this.first.set(0);
    this.loadUsers();
  }

  onFilterChange(): void {
    this.first.set(0);
    this.loadUsers();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.roleFilter.set(undefined);
    this.activeFilter.set(undefined);
    this.verifiedFilter.set(undefined);
    this.first.set(0);
    this.loadUsers();
  }

  openEditDialog(user: AdminUser): void {
    this.editingUser.set(user);
    this.editForm.set({
      displayName: user.displayName,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
    });
    this.showEditDialog.set(true);
  }

  closeEditDialog(): void {
    this.showEditDialog.set(false);
    this.editingUser.set(null);
    this.editForm.set({});
  }

  saveUser(): void {
    const user = this.editingUser();
    const form = this.editForm();

    if (!user) return;

    this.saving.set(true);

    this.adminService
      .updateUser(user.id, form)
      .then(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'User Updated',
          detail: `Successfully updated ${user.displayName}`,
        });
        this.closeEditDialog();
        this.saving.set(false);
      })
      .catch((err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Update Failed',
          detail: err.error?.message || 'Failed to update user',
        });
        this.saving.set(false);
      });
  }

  toggleRole(user: AdminUser): void {
    const newRole: UserRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    const action = newRole === 'ADMIN' ? 'promote to Admin' : 'demote to User';

    if (user.id === this.currentUser()?.id && newRole === 'USER') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Cannot Demote',
        detail: 'You cannot demote yourself from admin',
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to ${action} "${user.displayName}"?`,
      header: 'Confirm Role Change',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.adminService
          .updateUser(user.id, { role: newRole })
          .then(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Role Updated',
              detail: `${user.displayName} is now ${newRole === 'ADMIN' ? 'an Admin' : 'a User'}`,
            });
          })
          .catch((err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Update Failed',
              detail: err.error?.message || 'Failed to update role',
            });
          });
      },
    });
  }

  toggleActive(user: AdminUser): void {
    if (user.id === this.currentUser()?.id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Cannot Deactivate',
        detail: 'You cannot deactivate your own account',
      });
      return;
    }

    const action = user.isActive ? 'deactivate' : 'activate';

    this.confirmationService.confirm({
      message: `Are you sure you want to ${action} "${user.displayName}"?`,
      header: `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (user.isActive) {
          this.adminService
            .deactivateUser(user.id)
            .then(() => {
              this.messageService.add({
                severity: 'success',
                summary: 'User Deactivated',
                detail: `${user.displayName} has been deactivated`,
              });
            })
            .catch((err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Deactivation Failed',
                detail: err.error?.message || 'Failed to deactivate user',
              });
            });
        } else {
          this.adminService
            .updateUser(user.id, { isActive: true })
            .then(() => {
              this.messageService.add({
                severity: 'success',
                summary: 'User Activated',
                detail: `${user.displayName} has been activated`,
              });
            })
            .catch((err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Activation Failed',
                detail: err.error?.message || 'Failed to activate user',
              });
            });
        }
      },
    });
  }

  verifyEmail(user: AdminUser): void {
    this.confirmationService.confirm({
      message: `Manually verify email for "${user.displayName}"?`,
      header: 'Confirm Email Verification',
      icon: 'pi pi-check-circle',
      accept: () => {
        this.adminService
          .updateUser(user.id, { emailVerified: true })
          .then(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Email Verified',
              detail: `${user.displayName}'s email has been verified`,
            });
          })
          .catch((err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Verification Failed',
              detail: err.error?.message || 'Failed to verify email',
            });
          });
      },
    });
  }

  forcePasswordReset(user: AdminUser): void {
    this.confirmationService.confirm({
      message: `Send password reset email to "${user.email}"?`,
      header: 'Force Password Reset',
      icon: 'pi pi-key',
      accept: () => {
        this.adminService
          .forcePasswordReset(user.id)
          .then((response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Password Reset Initiated',
              detail: response.message,
            });
          })
          .catch((err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Reset Failed',
              detail: err.error?.message || 'Failed to initiate password reset',
            });
          });
      },
    });
  }

  getRoleSeverity(role: UserRole): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    return role === 'ADMIN' ? 'warn' : 'info';
  }

  getStatusSeverity(isActive: boolean): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    return isActive ? 'success' : 'danger';
  }

  getVerifiedSeverity(verified: boolean): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    return verified ? 'success' : 'secondary';
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Edit form update methods
  updateDisplayName(value: string): void {
    this.editForm.update((f) => ({ ...f, displayName: value }));
  }

  updateRole(value: UserRole): void {
    this.editForm.update((f) => ({ ...f, role: value }));
  }

  updateIsActive(value: boolean): void {
    this.editForm.update((f) => ({ ...f, isActive: value }));
  }

  updateEmailVerified(value: boolean): void {
    this.editForm.update((f) => ({ ...f, emailVerified: value }));
  }

  private mapSortField(field: string): string {
    const mapping: Record<string, string> = {
      email: 'email',
      displayName: 'displayName',
      role: 'role',
      createdAt: 'createdAt',
      lastLoginAt: 'lastLoginAt',
    };
    return mapping[field] || 'createdAt';
  }
}
