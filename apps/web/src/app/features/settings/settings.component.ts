import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SettingsService } from '../../core/services/settings.service';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService, Theme } from '../../core/services/theme.service';
import {
  GameSystem,
  PaintBrand,
  ViewMode,
  SortOrder,
} from '@minipaint-pro/types';

interface SelectOption<T> {
  label: string;
  value: T;
}

const GAME_SYSTEM_OPTIONS: SelectOption<GameSystem | null>[] = [
  { label: 'None', value: null },
  { label: 'Warhammer 40K', value: 'WARHAMMER_40K' },
  { label: 'Age of Sigmar', value: 'AGE_OF_SIGMAR' },
  { label: 'Kill Team', value: 'KILL_TEAM' },
  { label: 'Necromunda', value: 'NECROMUNDA' },
  { label: 'Horus Heresy', value: 'HORUS_HERESY' },
  { label: 'Other', value: 'OTHER' },
];

const PAINT_BRAND_OPTIONS: SelectOption<PaintBrand | null>[] = [
  { label: 'All Brands', value: null },
  { label: 'Citadel', value: 'citadel' },
  { label: 'Vallejo', value: 'vallejo' },
  { label: 'Army Painter', value: 'armyPainter' },
  { label: 'Scale75', value: 'scale75' },
  { label: 'AK Interactive', value: 'akInteractive' },
  { label: 'Turbo Dork', value: 'turboDork' },
  { label: 'Other', value: 'other' },
];

const VIEW_MODE_OPTIONS: SelectOption<ViewMode>[] = [
  { label: 'Grid', value: 'GRID' },
  { label: 'List', value: 'LIST' },
];

const SORT_ORDER_OPTIONS: SelectOption<SortOrder>[] = [
  { label: 'Descending', value: 'DESC' },
  { label: 'Ascending', value: 'ASC' },
];

const ITEMS_PER_PAGE_OPTIONS: SelectOption<number>[] = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
];

const THEME_OPTIONS: SelectOption<Theme>[] = [
  { label: 'Dark', value: 'dark' },
  { label: 'Light', value: 'light' },
];

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    SelectModule,
    InputNumberModule,
    ToggleSwitchModule,
    DividerModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    TabsModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit {
  private readonly settingsService = inject(SettingsService);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);

  // Options
  readonly gameSystemOptions = GAME_SYSTEM_OPTIONS;
  readonly paintBrandOptions = PAINT_BRAND_OPTIONS;
  readonly viewModeOptions = VIEW_MODE_OPTIONS;
  readonly sortOrderOptions = SORT_ORDER_OPTIONS;
  readonly itemsPerPageOptions = ITEMS_PER_PAGE_OPTIONS;
  readonly themeOptions = THEME_OPTIONS;

  // Theme
  readonly currentTheme = this.themeService.theme;

  // Service signals
  readonly profile = this.settingsService.profile;
  readonly profileLoading = this.settingsService.profileLoading;
  readonly preferences = this.settingsService.preferences;
  readonly preferencesLoading = this.settingsService.preferencesLoading;
  readonly sessions = this.settingsService.sessions;
  readonly sessionsLoading = this.settingsService.sessionsLoading;

  // Local form state
  profileForm = {
    displayName: '',
    email: '',
  };

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  preferencesForm = {
    defaultGameSystem: null as GameSystem | null,
    defaultPaintBrand: null as PaintBrand | null,
    itemsPerPage: 20,
    defaultViewMode: 'GRID' as ViewMode,
    showCompletedMinis: true,
    defaultSortOrder: 'DESC' as SortOrder,
    emailNotifications: true,
    streakReminders: true,
  };

  deleteAccountPassword = '';
  showDeleteDialog = signal(false);

  // Computed values
  readonly memberSince = computed(() => {
    const profile = this.profile();
    if (!profile?.createdAt) return 'Unknown';
    return new Date(profile.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });

  readonly lastLogin = computed(() => {
    const profile = this.profile();
    if (!profile?.lastLoginAt) return 'Never';
    return new Date(profile.lastLoginAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  });

  ngOnInit(): void {
    this.settingsService.loadProfile();
    this.settingsService.loadPreferences();
    this.settingsService.loadSessions();

    // Initialize forms when data loads
    this.initFormWatchers();
  }

  private initFormWatchers(): void {
    // Wait for profile to load and initialize form
    const checkProfile = setInterval(() => {
      const profile = this.profile();
      if (profile) {
        this.profileForm = {
          displayName: profile.displayName,
          email: profile.email,
        };
        clearInterval(checkProfile);
      }
    }, 100);

    // Wait for preferences to load and initialize form
    const checkPreferences = setInterval(() => {
      const prefs = this.preferences();
      if (prefs) {
        this.preferencesForm = {
          defaultGameSystem: prefs.defaultGameSystem,
          defaultPaintBrand: prefs.defaultPaintBrand,
          itemsPerPage: prefs.itemsPerPage,
          defaultViewMode: prefs.defaultViewMode,
          showCompletedMinis: prefs.showCompletedMinis,
          defaultSortOrder: prefs.defaultSortOrder,
          emailNotifications: prefs.emailNotifications,
          streakReminders: prefs.streakReminders,
        };
        clearInterval(checkPreferences);
      }
    }, 100);
  }

  // ==================== Profile ====================

  async onSaveProfile(): Promise<void> {
    const result = await this.settingsService.updateProfile({
      displayName: this.profileForm.displayName,
      email: this.profileForm.email,
    });

    if (result.success) {
      this.messageService.add({
        severity: 'success',
        summary: 'Profile Updated',
        detail: result.message,
      });

      // If email was changed, show additional message
      const currentEmail = this.profile()?.email;
      if (currentEmail && this.profileForm.email !== currentEmail) {
        this.messageService.add({
          severity: 'info',
          summary: 'Verification Required',
          detail: 'Please check your new email to verify it.',
          life: 10000,
        });
      }
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: result.message,
      });
    }
  }

  // ==================== Security ====================

  isPasswordFormValid(): boolean {
    return (
      this.passwordForm.currentPassword.length > 0 &&
      this.passwordForm.newPassword.length >= 8 &&
      this.passwordForm.newPassword === this.passwordForm.confirmPassword
    );
  }

  async onChangePassword(): Promise<void> {
    if (!this.isPasswordFormValid()) return;

    const result = await this.settingsService.changePassword({
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword,
    });

    if (result.success) {
      this.messageService.add({
        severity: 'success',
        summary: 'Password Changed',
        detail: result.message,
      });
      this.passwordForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      };
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: result.message,
      });
    }
  }

  async onRevokeSession(sessionId: string): Promise<void> {
    const result = await this.settingsService.revokeSession(sessionId);

    if (result.success) {
      this.messageService.add({
        severity: 'success',
        summary: 'Session Revoked',
        detail: 'The device has been logged out.',
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: result.message,
      });
    }
  }

  async onLogoutAll(): Promise<void> {
    this.confirmationService.confirm({
      message: 'This will log you out from all devices including this one. Continue?',
      header: 'Logout All Devices',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        await this.authService.logoutAll();
      },
    });
  }

  // ==================== Preferences ====================

  async onSavePreferences(): Promise<void> {
    const result = await this.settingsService.updatePreferences(this.preferencesForm);

    if (result.success) {
      this.messageService.add({
        severity: 'success',
        summary: 'Preferences Saved',
        detail: result.message,
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: result.message,
      });
    }
  }

  // ==================== Account ====================

  openDeleteDialog(): void {
    this.deleteAccountPassword = '';
    this.showDeleteDialog.set(true);
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog.set(false);
    this.deleteAccountPassword = '';
  }

  async onDeleteAccount(): Promise<void> {
    if (!this.deleteAccountPassword) return;

    const result = await this.settingsService.deleteAccount(this.deleteAccountPassword);

    if (result.success) {
      this.closeDeleteDialog();
      this.messageService.add({
        severity: 'success',
        summary: 'Account Deleted',
        detail: 'Your account has been permanently deleted.',
      });
      // Redirect to login after a short delay
      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 2000);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: result.message,
      });
    }
  }

  // ==================== Theme ====================

  onThemeChange(theme: Theme): void {
    this.themeService.setTheme(theme);
  }

  // ==================== Helpers ====================

  formatUserAgent(userAgent: string | null): string {
    if (!userAgent) return 'Unknown Device';

    // Simple parsing - extract browser and OS
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown Browser';
  }

  formatSessionDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
