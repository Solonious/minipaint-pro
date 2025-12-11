import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  OnInit,
  ElementRef,
  ViewChild,
  Renderer2,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AdminService, UnitImage } from '../../core/services/admin.service';
import { WahapediaService, WahapediaFaction, WahapediaUnit } from '../../core/services/wahapedia.service';
import { GameSystem } from '@minipaint-pro/types';

interface GameSystemOption {
  label: string;
  value: GameSystem;
}

const GAME_SYSTEMS: GameSystemOption[] = [
  { label: 'Warhammer 40K', value: 'WARHAMMER_40K' },
  { label: 'Age of Sigmar', value: 'AGE_OF_SIGMAR' },
  { label: 'Kill Team', value: 'KILL_TEAM' },
  { label: 'Necromunda', value: 'NECROMUNDA' },
  { label: 'Horus Heresy', value: 'HORUS_HERESY' },
  { label: 'Other', value: 'OTHER' },
];

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SelectModule,
    ButtonModule,
    InputTextModule,
    TableModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    ProgressSpinnerModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private readonly adminService = inject(AdminService);
  private readonly wahapediaService = inject(WahapediaService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly renderer = inject(Renderer2);

  readonly gameSystemOptions = GAME_SYSTEMS;
  readonly images = this.adminService.images;
  readonly loading = this.adminService.loading;
  readonly stats = this.adminService.stats;
  readonly factions = this.wahapediaService.factions;
  readonly wahapediaLoading = this.wahapediaService.loading;

  readonly selectedGameSystem = signal<GameSystem>('WARHAMMER_40K');
  readonly selectedFaction = signal<WahapediaFaction | null>(null);
  readonly selectedUnit = signal<WahapediaUnit | null>(null);
  readonly importUrl = signal('');
  readonly uploading = signal(false);
  readonly showImportDialog = signal(false);

  readonly factionOptions = computed(() => {
    return this.factions().map((f) => ({ label: f.name, value: f }));
  });

  readonly unitOptions = computed(() => {
    const faction = this.selectedFaction();
    if (!faction) return [];

    const units = this.wahapediaService.getUnitsForFaction(faction.id);
    return units.map((u) => ({ label: u.name, value: u }));
  });

  readonly filteredImages = computed(() => {
    const images = this.images();
    const gameSystem = this.selectedGameSystem();
    const faction = this.selectedFaction();

    return images.filter((img) => {
      if (gameSystem && img.gameSystem !== gameSystem) return false;
      if (faction && img.faction !== faction.name) return false;
      return true;
    });
  });

  ngOnInit(): void {
    this.adminService.loadImages();
    this.adminService.loadStats();
    this.loadWahapediaData();
  }

  onGameSystemChange(value: GameSystem): void {
    this.selectedGameSystem.set(value);
    this.selectedFaction.set(null);
    this.selectedUnit.set(null);
    this.loadWahapediaData();
    this.adminService.loadImages(value);
  }

  onFactionChange(faction: WahapediaFaction | null): void {
    this.selectedFaction.set(faction);
    this.selectedUnit.set(null);
  }

  onUnitChange(unit: WahapediaUnit | null): void {
    this.selectedUnit.set(unit);
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const faction = this.selectedFaction();
    const unit = this.selectedUnit();

    if (!faction || !unit) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Missing Selection',
        detail: 'Please select a faction and unit first',
      });
      return;
    }

    this.uploadFile(file, faction.name, unit.name);
    input.value = '';
  }

  private uploadFile(file: File, faction: string, unitName: string): void {
    this.uploading.set(true);

    this.adminService
      .uploadImage(file, this.selectedGameSystem(), faction, unitName)
      .then(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Upload Complete',
          detail: `Image uploaded for ${unitName}`,
        });
        this.uploading.set(false);
      })
      .catch((err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Upload Failed',
          detail: err.error?.message || 'Failed to upload image',
        });
        this.uploading.set(false);
      });
  }

  openImportDialog(): void {
    const faction = this.selectedFaction();
    const unit = this.selectedUnit();

    if (!faction || !unit) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Missing Selection',
        detail: 'Please select a faction and unit first',
      });
      return;
    }

    this.importUrl.set('');
    this.showImportDialog.set(true);
  }

  closeImportDialog(): void {
    this.showImportDialog.set(false);
    this.importUrl.set('');
  }

  importFromUrl(): void {
    const url = this.importUrl();
    const faction = this.selectedFaction();
    const unit = this.selectedUnit();

    if (!url || !faction || !unit) return;

    this.uploading.set(true);
    this.showImportDialog.set(false);

    const source = url.includes('warhammer-community.com')
      ? 'WARHAMMER_COMMUNITY' as const
      : url.includes('games-workshop.com')
        ? 'GAMES_WORKSHOP' as const
        : undefined;

    this.adminService
      .importImage(this.selectedGameSystem(), faction.name, unit.name, url, source)
      .then(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Import Complete',
          detail: `Image imported for ${unit.name}`,
        });
        this.uploading.set(false);
        this.importUrl.set('');
      })
      .catch((err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Import Failed',
          detail: err.error?.message || 'Failed to import image',
        });
        this.uploading.set(false);
      });
  }

  deleteImage(image: UnitImage): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the image for "${image.unitName}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.adminService
          .deleteImage(image.id)
          .then(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: `Image deleted for ${image.unitName}`,
            });
          })
          .catch(() => {
            this.messageService.add({
              severity: 'error',
              summary: 'Delete Failed',
              detail: 'Failed to delete image',
            });
          });
      },
    });
  }

  getImageUrl(image: UnitImage): string {
    return this.adminService.getImageUrl(image.filename);
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  private loadWahapediaData(): void {
    const gameSystem = this.selectedGameSystem();
    if (gameSystem) {
      this.wahapediaService.loadData(gameSystem);
    }
  }
}
