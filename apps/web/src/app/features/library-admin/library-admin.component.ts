import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { FileUploadModule } from 'primeng/fileupload';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { MiniatureService } from '../../core/services/miniature.service';
import { MiniatureLibraryService } from '../../core/services/miniature-library.service';
import { PaintService } from '../../core/services/paint.service';
import { Miniature, MiniatureImage, MiniatureTutorial } from '@minipaint-pro/types';

interface ImageTypeOption {
  label: string;
  value: string;
}

interface PlatformOption {
  label: string;
  value: string;
}

const IMAGE_TYPES: ImageTypeOption[] = [
  { label: 'Reference', value: 'REFERENCE' },
  { label: 'Work in Progress', value: 'WIP' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Detail Shot', value: 'DETAIL' },
];

const PLATFORMS: PlatformOption[] = [
  { label: 'YouTube', value: 'YOUTUBE' },
  { label: 'Vimeo', value: 'VIMEO' },
  { label: 'Other', value: 'CUSTOM' },
];

@Component({
  selector: 'app-library-admin',
  standalone: true,
  imports: [
    FormsModule,
    SelectModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    TableModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    TabsModule,
    FileUploadModule,
    TooltipModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './library-admin.component.html',
  styleUrl: './library-admin.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryAdminComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private readonly router = inject(Router);
  private readonly miniatureService = inject(MiniatureService);
  private readonly libraryService = inject(MiniatureLibraryService);
  private readonly paintService = inject(PaintService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly imageTypeOptions = IMAGE_TYPES;
  readonly platformOptions = PLATFORMS;

  readonly miniatures = this.miniatureService.miniatures;
  readonly loading = this.miniatureService.loading;
  readonly libraryLoading = this.libraryService.loading;
  readonly currentMiniature = this.libraryService.currentMiniature;
  readonly images = this.libraryService.images;
  readonly colorScheme = this.libraryService.colorScheme;
  readonly tutorials = this.libraryService.tutorials;
  readonly paints = this.paintService.paints;

  readonly selectedMiniature = signal<Miniature | null>(null);
  readonly activeTab = signal(0);

  // Image dialog
  readonly showImageDialog = signal(false);
  readonly imageCaption = signal('');
  readonly imageType = signal('REFERENCE');
  readonly selectedFile = signal<File | null>(null);
  readonly uploading = signal(false);

  // Tutorial dialog
  readonly showTutorialDialog = signal(false);
  readonly tutorialTitle = signal('');
  readonly tutorialUrl = signal('');
  readonly tutorialAuthor = signal('');
  readonly tutorialDuration = signal<number | null>(null);
  readonly tutorialPlatform = signal('YOUTUBE');
  readonly editingTutorial = signal<MiniatureTutorial | null>(null);

  // Color scheme dialog
  readonly showSchemeDialog = signal(false);
  readonly schemeName = signal('');
  readonly schemeSections = signal<{ areaName: string; paints: { paintId: string; technique: string }[] }[]>([]);

  readonly miniatureOptions = computed(() => {
    return this.miniatures().map((m) => ({
      label: `${m.name} (${m.faction})`,
      value: m,
    }));
  });

  readonly paintOptions = computed(() => {
    return this.paints().map((p) => ({
      label: `${p.name} (${p.brand})`,
      value: p.id,
    }));
  });

  onMiniatureChange(miniature: Miniature | null): void {
    this.selectedMiniature.set(miniature);
    if (miniature) {
      this.libraryService.loadMiniatureWithLibrary(miniature.id);
    } else {
      this.libraryService.clear();
    }
  }

  // Image methods
  openImageDialog(): void {
    this.imageCaption.set('');
    this.imageType.set('REFERENCE');
    this.selectedFile.set(null);
    this.showImageDialog.set(true);
  }

  closeImageDialog(): void {
    this.showImageDialog.set(false);
    this.selectedFile.set(null);
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.selectedFile.set(input.files[0]);
    }
  }

  uploadImage(): void {
    const file = this.selectedFile();
    const miniature = this.selectedMiniature();

    if (!file || !miniature) return;

    this.uploading.set(true);

    this.libraryService
      .uploadImage(miniature.id, file, {
        caption: this.imageCaption() || undefined,
        imageType: this.imageType() as 'reference' | 'wip' | 'completed' | 'detail',
      })
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Image uploaded successfully',
          });
          this.closeImageDialog();
          this.uploading.set(false);
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Failed to upload image',
          });
          this.uploading.set(false);
        },
      });
  }

  deleteImage(image: MiniatureImage): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this image?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.libraryService.deleteImage(image.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Image deleted successfully',
        });
      },
    });
  }

  getImageUrl(filename: string): string {
    return this.libraryService.getImageUrl(filename);
  }

  // Tutorial methods
  openTutorialDialog(tutorial?: MiniatureTutorial): void {
    if (tutorial) {
      this.editingTutorial.set(tutorial);
      this.tutorialTitle.set(tutorial.title);
      this.tutorialUrl.set(tutorial.videoUrl);
      this.tutorialAuthor.set(tutorial.author || '');
      this.tutorialDuration.set(tutorial.duration || null);
      this.tutorialPlatform.set(tutorial.platform.toUpperCase());
    } else {
      this.editingTutorial.set(null);
      this.tutorialTitle.set('');
      this.tutorialUrl.set('');
      this.tutorialAuthor.set('');
      this.tutorialDuration.set(null);
      this.tutorialPlatform.set('YOUTUBE');
    }
    this.showTutorialDialog.set(true);
  }

  closeTutorialDialog(): void {
    this.showTutorialDialog.set(false);
    this.editingTutorial.set(null);
  }

  saveTutorial(): void {
    const miniature = this.selectedMiniature();
    if (!miniature) return;

    const editing = this.editingTutorial();

    if (editing) {
      this.libraryService.updateTutorial(editing.id, {
        title: this.tutorialTitle(),
        videoUrl: this.tutorialUrl(),
        author: this.tutorialAuthor() || undefined,
        duration: this.tutorialDuration() || undefined,
        platform: this.tutorialPlatform().toLowerCase() as 'youtube' | 'vimeo' | 'custom',
      });
    } else {
      this.libraryService.addTutorial({
        miniatureId: miniature.id,
        title: this.tutorialTitle(),
        videoUrl: this.tutorialUrl(),
        author: this.tutorialAuthor() || undefined,
        duration: this.tutorialDuration() || undefined,
        platform: this.tutorialPlatform().toLowerCase() as 'youtube' | 'vimeo' | 'custom',
      });
    }

    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: editing ? 'Tutorial updated' : 'Tutorial added',
    });
    this.closeTutorialDialog();
  }

  deleteTutorial(tutorial: MiniatureTutorial): void {
    this.confirmationService.confirm({
      message: `Delete tutorial "${tutorial.title}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.libraryService.deleteTutorial(tutorial.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Tutorial deleted',
        });
      },
    });
  }

  // Color scheme methods
  openSchemeDialog(): void {
    const scheme = this.colorScheme();
    if (scheme) {
      this.schemeName.set(scheme.name);
      this.schemeSections.set(
        scheme.sections.map((s) => ({
          areaName: s.areaName,
          paints: s.paints.map((p) => ({
            paintId: p.paint?.id || '',
            technique: p.technique || '',
          })),
        }))
      );
    } else {
      this.schemeName.set('');
      this.schemeSections.set([{ areaName: '', paints: [{ paintId: '', technique: '' }] }]);
    }
    this.showSchemeDialog.set(true);
  }

  closeSchemeDialog(): void {
    this.showSchemeDialog.set(false);
  }

  addSection(): void {
    this.schemeSections.update((sections) => [
      ...sections,
      { areaName: '', paints: [{ paintId: '', technique: '' }] },
    ]);
  }

  removeSection(index: number): void {
    this.schemeSections.update((sections) => sections.filter((_, i) => i !== index));
  }

  addPaintToSection(sectionIndex: number): void {
    this.schemeSections.update((sections) => {
      const updated = [...sections];
      updated[sectionIndex] = {
        ...updated[sectionIndex],
        paints: [...updated[sectionIndex].paints, { paintId: '', technique: '' }],
      };
      return updated;
    });
  }

  removePaintFromSection(sectionIndex: number, paintIndex: number): void {
    this.schemeSections.update((sections) => {
      const updated = [...sections];
      updated[sectionIndex] = {
        ...updated[sectionIndex],
        paints: updated[sectionIndex].paints.filter((_, i) => i !== paintIndex),
      };
      return updated;
    });
  }

  updateSectionName(sectionIndex: number, name: string): void {
    this.schemeSections.update((sections) => {
      const updated = [...sections];
      updated[sectionIndex] = { ...updated[sectionIndex], areaName: name };
      return updated;
    });
  }

  updateSectionPaint(sectionIndex: number, paintIndex: number, field: 'paintId' | 'technique', value: string): void {
    this.schemeSections.update((sections) => {
      const updated = [...sections];
      const paints = [...updated[sectionIndex].paints];
      paints[paintIndex] = { ...paints[paintIndex], [field]: value };
      updated[sectionIndex] = { ...updated[sectionIndex], paints };
      return updated;
    });
  }

  saveScheme(): void {
    const miniature = this.selectedMiniature();
    const existingScheme = this.colorScheme();

    if (!miniature) return;

    // Delete existing scheme first if it exists
    if (existingScheme) {
      this.libraryService.deleteColorScheme(existingScheme.id);
    }

    // Create new scheme
    const sections = this.schemeSections()
      .filter((s) => s.areaName.trim())
      .map((s) => ({
        areaName: s.areaName,
        paints: s.paints
          .filter((p) => p.paintId)
          .map((p) => ({
            paintId: p.paintId,
            technique: p.technique || undefined,
          })),
      }));

    this.libraryService.saveColorScheme({
      miniatureId: miniature.id,
      name: this.schemeName(),
      sections,
    });

    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Color scheme saved',
    });
    this.closeSchemeDialog();
  }

  deleteScheme(): void {
    const scheme = this.colorScheme();
    if (!scheme) return;

    this.confirmationService.confirm({
      message: 'Delete this color scheme?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.libraryService.deleteColorScheme(scheme.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Color scheme deleted',
        });
      },
    });
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  goToLibrary(): void {
    const miniature = this.selectedMiniature();
    if (miniature) {
      this.router.navigate(['/library', miniature.id]);
    }
  }
}
