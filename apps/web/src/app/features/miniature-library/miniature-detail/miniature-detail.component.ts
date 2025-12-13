import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  computed,
  signal,
  ChangeDetectionStrategy,
  HostListener,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { GalleriaModule } from 'primeng/galleria';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MiniatureLibraryService } from '../../../core/services/miniature-library.service';
import { AuthService } from '../../../core/services/auth.service';
import { PageLoaderComponent } from '../../../shared/components/loading-skeleton/page-loader.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PointsBadgeComponent } from '../../../shared/components/points-badge/points-badge.component';
import { MiniatureTutorial } from '@minipaint-pro/types';

interface PlatformOption {
  label: string;
  value: string;
}

const PLATFORMS: PlatformOption[] = [
  { label: 'YouTube', value: 'youtube' },
  { label: 'Vimeo', value: 'vimeo' },
  { label: 'Other', value: 'custom' },
];

// Games Workshop search URL patterns
const GW_SEARCH_URL = 'https://www.warhammer.com/en-WW/plp?search=';

@Component({
  selector: 'app-miniature-detail',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    GalleriaModule,
    TagModule,
    TooltipModule,
    DialogModule,
    SelectModule,
    InputTextModule,
    InputNumberModule,
    ToastModule,
    PageLoaderComponent,
    StatusBadgeComponent,
    PointsBadgeComponent,
  ],
  providers: [MessageService],
  template: `
    <p-toast />

    <div class="detail-container">
      @if (loading()) {
        <app-page-loader />
      } @else if (miniature()) {
        <header class="detail-header">
          <button
            pButton
            icon="pi pi-arrow-left"
            class="p-button-text p-button-plain back-button"
            (click)="goBack()"
            pTooltip="Back to Library"
            aria-label="Back to Library"
          ></button>

          <div class="header-content">
            <div class="title-row">
              <h1>{{ miniature()!.name }}</h1>
              <button
                pButton
                icon="pi pi-copy"
                class="p-button-text p-button-rounded p-button-sm copy-btn"
                (click)="copyToClipboard()"
                pTooltip="Copy name to clipboard"
                aria-label="Copy name to clipboard"
              ></button>
            </div>
            <div class="header-meta">
              <span class="faction">{{ miniature()!.faction }}</span>
              <app-status-badge [status]="miniature()!.status" />
              <app-points-badge [points]="miniature()!.points" />
              @if (miniature()!.modelCount > 1) {
                <span class="model-count">{{ miniature()!.modelCount }} models</span>
              }
            </div>
          </div>
        </header>

        <div class="detail-content">
          <!-- Image Gallery -->
          <section class="gallery-section">
            <div class="section-header">
              <h2><i class="pi pi-images"></i> Reference Images</h2>
              <div class="section-actions">
                <a
                  [href]="getGamesWorkshopUrl()"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="p-button p-button-text p-button-sm official-ref-btn"
                  pTooltip="Find official reference images"
                >
                  <i class="pi pi-external-link"></i> Official Reference
                </a>
                @if (canEdit()) {
                  <button
                    pButton
                    icon="pi pi-plus"
                    label="Add Image"
                    class="p-button-outlined p-button-sm"
                    (click)="openImageDialog()"
                  ></button>
                }
              </div>
            </div>

            <!-- Fullscreen Galleria (hidden, used for fullscreen view only) -->
            @if (images().length > 0) {
              <p-galleria
                #galleria
                [value]="galleryImages()"
                [showThumbnails]="true"
                [showIndicators]="false"
                [showItemNavigators]="true"
                [responsiveOptions]="responsiveOptions"
                [containerStyle]="{ 'max-width': '100%' }"
                [(visible)]="fullscreenVisible"
                (visibleChange)="onGalleriaVisibleChange($event)"
                [fullScreen]="true"
                [baseZIndex]="100000"
                [(activeIndex)]="activeImageIndex"
              >
                <ng-template #closeicon>
                  <button
                    class="galleria-close-btn"
                    (click)="closeFullscreen()"
                    aria-label="Close fullscreen"
                  >
                    <i class="pi pi-times"></i>
                  </button>
                </ng-template>
                <ng-template #item let-item>
                  <div class="gallery-item">
                    <img [src]="item.src" [alt]="item.alt" (error)="onImageError($event)" />
                    @if (item.caption) {
                      <div class="image-caption">{{ item.caption }}</div>
                    }
                  </div>
                </ng-template>
                <ng-template #thumbnail let-item>
                  <div class="thumbnail-wrapper">
                    <img [src]="item.src" [alt]="item.alt" class="thumbnail" (error)="onImageError($event)" />
                  </div>
                </ng-template>
              </p-galleria>
            }

            <!-- Image Preview Grid -->
            @if (images().length > 0) {
              <div class="preview-thumbnails">
                @for (img of galleryImages(); track img.src; let i = $index) {
                  <div class="preview-wrapper">
                    <img
                      [src]="img.src"
                      [alt]="img.alt"
                      class="preview-thumb"
                      (click)="activeImageIndex = i; openFullscreen()"
                      [pTooltip]="img.caption || 'Click to enlarge'"
                      (error)="onImageError($event)"
                    />
                    @if (canEdit()) {
                      <button
                        class="delete-preview-btn"
                        (click)="deleteImage(img.id, $event)"
                        pTooltip="Delete"
                      >
                        <i class="pi pi-times"></i>
                      </button>
                    }
                  </div>
                }
              </div>
            } @else {
              <div class="empty-section">
                <i class="pi pi-image"></i>
                <p>No images yet</p>
                @if (canEdit()) {
                  <button
                    pButton
                    icon="pi pi-plus"
                    label="Add First Image"
                    class="p-button-outlined"
                    (click)="openImageDialog()"
                  ></button>
                }
              </div>
            }
          </section>

          <!-- Tutorial Videos -->
          <section class="tutorials-section">
            <div class="section-header">
              <h2><i class="pi pi-youtube"></i> Tutorial Videos</h2>
              <div class="section-actions">
                <a
                  [href]="getYouTubeSearchUrl()"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="p-button p-button-text p-button-sm youtube-search-btn"
                  pTooltip="Search YouTube for tutorials"
                >
                  <img src="assets/icons/references/youtube.svg" alt="YouTube" class="ref-icon" /> Find on YouTube
                </a>
                @if (canEdit()) {
                  <button
                    pButton
                    icon="pi pi-plus"
                    label="Add Tutorial"
                    class="p-button-outlined p-button-sm"
                    (click)="openTutorialDialog()"
                  ></button>
                }
              </div>
            </div>

            @if (tutorials().length > 0) {
              <div class="tutorials-list">
                @for (tutorial of tutorials(); track tutorial.id) {
                  <div class="tutorial-card">
                    <div class="video-embed">
                      @if (getVideoEmbedUrl(tutorial); as embedUrl) {
                        <iframe
                          [src]="embedUrl"
                          frameborder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowfullscreen
                        ></iframe>
                      }
                    </div>
                    <div class="tutorial-info">
                      <h4>{{ tutorial.title }}</h4>
                      <div class="tutorial-meta">
                        @if (tutorial.author) {
                          <span class="author"><i class="pi pi-user"></i> {{ tutorial.author }}</span>
                        }
                        @if (tutorial.duration) {
                          <span class="duration"><i class="pi pi-clock"></i> {{ formatDuration(tutorial.duration) }}</span>
                        }
                        <span class="platform-badge" [class]="tutorial.platform">
                          {{ tutorial.platform }}
                        </span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="empty-section">
                <i class="pi pi-video"></i>
                <p>No tutorial videos yet</p>
                <div class="empty-actions">
                  <a
                    [href]="getYouTubeSearchUrl()"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="p-button p-button-outlined"
                  >
                    <img src="assets/icons/references/youtube.svg" alt="YouTube" class="ref-icon" /> Search YouTube
                  </a>
                  @if (canEdit()) {
                    <button
                      pButton
                      icon="pi pi-plus"
                      label="Add Tutorial"
                      class="p-button-outlined"
                      (click)="openTutorialDialog()"
                    ></button>
                  }
                </div>
              </div>
            }
          </section>

          <!-- Color Scheme -->
          <section class="scheme-section">
            <h2><i class="pi pi-palette"></i> Paint Scheme</h2>
            @if (colorScheme()) {
              <div class="scheme-name">{{ colorScheme()!.name }}</div>
              <div class="sections-list">
                @for (section of colorScheme()!.sections; track section.id) {
                  <div class="scheme-section-item">
                    <h4>{{ section.areaName }}</h4>
                    <div class="paints-row">
                      @for (sectionPaint of section.paints; track sectionPaint.id) {
                        <div class="paint-swatch" [pTooltip]="getPaintTooltip(sectionPaint)">
                          <div
                            class="swatch-color"
                            [style.background-color]="sectionPaint.paint?.colorHex || '#666'"
                          ></div>
                          <span class="paint-name">{{ sectionPaint.paint?.name }}</span>
                          @if (sectionPaint.technique) {
                            <span class="technique">{{ sectionPaint.technique }}</span>
                          }
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="empty-section">
                <i class="pi pi-palette"></i>
                <p>No paint scheme defined</p>
              </div>
            }
          </section>

          <!-- Notes -->
          @if (miniature()!.notes) {
            <section class="notes-section">
              <h2><i class="pi pi-file-edit"></i> Notes</h2>
              <p class="notes-content">{{ miniature()!.notes }}</p>
            </section>
          }
        </div>
      } @else {
        <div class="not-found">
          <i class="pi pi-exclamation-circle"></i>
          <p>Miniature not found</p>
          <button pButton label="Back to Library" (click)="goBack()">Back to Library</button>
        </div>
      }
    </div>

    <!-- Add Image Dialog -->
    <p-dialog
      header="Add Reference Image"
      [(visible)]="showImageDialog"
      [modal]="true"
      [style]="{ width: '500px' }"
      [draggable]="false"
    >
      <div class="dialog-content">
        <!-- Quick Search Links -->
        <div class="quick-search-section">
          <span class="quick-search-label"><i class="pi pi-search"></i> Find images:</span>
          <div class="quick-search-links">
            <a
              [href]="getGamesWorkshopSearchUrl()"
              target="_blank"
              rel="noopener noreferrer"
              class="quick-search-link gw"
              pTooltip="Search on Games Workshop store"
            >
              <img src="assets/icons/references/games-workshop.svg" alt="GW" class="ref-icon" />
              Games Workshop
            </a>
            <a
              [href]="getGoogleImageSearchUrl()"
              target="_blank"
              rel="noopener noreferrer"
              class="quick-search-link google"
              pTooltip="Search on Google Images"
            >
              <i class="pi pi-google"></i>
              Google Images
            </a>
          </div>
          <small class="search-hint">Right-click on an image and "Copy image address" to paste below</small>
        </div>

        <div class="form-field">
          <label for="image-url">Image URL *</label>
          <input
            type="text"
            pInputText
            id="image-url"
            [(ngModel)]="imageUrlInput"
            placeholder="https://www.games-workshop.com/resources/catalog/..."
          />
        </div>

        @if (imageUrlInput()) {
          <div class="url-preview">
            <img [src]="imageUrlInput()" alt="Preview" (error)="onImagePreviewError($event)" />
          </div>
        }

        <div class="form-field">
          <label for="image-caption">Caption (optional)</label>
          <input type="text" pInputText id="image-caption" [(ngModel)]="imageCaption" />
        </div>
      </div>

      <ng-template pTemplate="footer">
        <button pButton label="Cancel" class="p-button-text" (click)="closeImageDialog()"></button>
        <button
          pButton
          label="Add Image"
          icon="pi pi-link"
          [disabled]="!imageUrlInput() || uploading()"
          [loading]="uploading()"
          (click)="addImageByUrl()"
        ></button>
      </ng-template>
    </p-dialog>

    <!-- Add Tutorial Dialog -->
    <p-dialog
      header="Add Tutorial Video"
      [(visible)]="showTutorialDialog"
      [modal]="true"
      [style]="{ width: '500px' }"
      [draggable]="false"
    >
      <div class="dialog-content">
        <div class="form-field">
          <label for="tutorial-url">Video URL *</label>
          <input
            type="text"
            pInputText
            id="tutorial-url"
            [(ngModel)]="tutorialUrl"
            placeholder="https://youtube.com/watch?v=..."
            (ngModelChange)="onTutorialUrlChange()"
          />
          <small class="hint">Paste any YouTube or Vimeo link</small>
        </div>

        <div class="form-field">
          <label for="tutorial-title">Title *</label>
          <input type="text" pInputText id="tutorial-title" [(ngModel)]="tutorialTitle" />
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="tutorial-platform">Platform</label>
            <p-select
              id="tutorial-platform"
              [options]="platformOptions"
              [(ngModel)]="tutorialPlatform"
              optionLabel="label"
              optionValue="value"
              appendTo="body"
            />
          </div>

          <div class="form-field">
            <label for="tutorial-duration">Duration (seconds)</label>
            <p-inputNumber id="tutorial-duration" [(ngModel)]="tutorialDuration" [min]="0" />
          </div>
        </div>

        <div class="form-field">
          <label for="tutorial-author">Author</label>
          <input type="text" pInputText id="tutorial-author" [(ngModel)]="tutorialAuthor" />
        </div>
      </div>

      <ng-template pTemplate="footer">
        <button pButton label="Cancel" class="p-button-text" (click)="closeTutorialDialog()">Cancel</button>
        <button
          pButton
          label="Add"
          icon="pi pi-plus"
          [disabled]="!tutorialTitle() || !tutorialUrl()"
          (click)="saveTutorial()"
        >Add</button>
      </ng-template>
    </p-dialog>
  `,
  styleUrl: './miniature-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiniatureDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly libraryService = inject(MiniatureLibraryService);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);

  readonly platformOptions = PLATFORMS;

  readonly loading = this.libraryService.loading;
  readonly miniature = this.libraryService.currentMiniature;
  readonly images = this.libraryService.images;
  readonly colorScheme = this.libraryService.colorScheme;
  readonly tutorials = this.libraryService.tutorials;

  readonly responsiveOptions = [
    { breakpoint: '1024px', numVisible: 5 },
    { breakpoint: '768px', numVisible: 3 },
    { breakpoint: '560px', numVisible: 2 },
  ];

  // Fullscreen gallery state
  fullscreenVisible = false;
  activeImageIndex = 0;

  // Image dialog state
  readonly showImageDialog = signal(false);
  readonly imageCaption = signal('');
  readonly imageUrlInput = signal('');
  readonly uploading = signal(false);

  // Tutorial dialog state
  readonly showTutorialDialog = signal(false);
  readonly tutorialTitle = signal('');
  readonly tutorialUrl = signal('');
  readonly tutorialAuthor = signal('');
  readonly tutorialDuration = signal<number | null>(null);
  readonly tutorialPlatform = signal('youtube');

  readonly galleryImages = computed(() => {
    return this.images().map((img) => ({
      id: img.id,
      // External URLs can be displayed directly in img tags (CORS doesn't affect image elements)
      // Only use proxy if the direct URL fails (handled by onImageError)
      src: img.imageUrl || this.libraryService.getImageUrl(img.filename),
      // Keep proxied URL as fallback for error handling
      proxySrc: img.imageUrl ? this.libraryService.getProxiedImageUrl(img.imageUrl) : null,
      alt: img.caption || img.originalName || 'Reference image',
      caption: img.caption,
      type: img.imageType,
    }));
  });

  readonly canEdit = computed(() => {
    const user = this.authService.user();
    const mini = this.miniature();
    if (!user || !mini) return false;
    // User can edit if they own the miniature or are admin
    return mini.userId === user.id || this.authService.isAdmin();
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.libraryService.loadMiniatureWithLibrary(id);
    }
  }

  ngOnDestroy(): void {
    this.libraryService.clear();
  }

  goBack(): void {
    this.router.navigate(['/library']);
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.fullscreenVisible) {
      this.closeFullscreen();
    }
  }

  openFullscreen(): void {
    this.fullscreenVisible = true;
  }

  closeFullscreen(): void {
    this.fullscreenVisible = false;
  }

  onGalleriaVisibleChange(visible: boolean): void {
    this.fullscreenVisible = visible;
  }

  deleteImage(id: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this image?')) {
      this.libraryService.deleteImage(id);
      this.messageService.add({
        severity: 'success',
        summary: 'Deleted',
        detail: 'Image deleted successfully',
      });
    }
  }

  copyToClipboard(): void {
    const mini = this.miniature();
    if (!mini) return;

    navigator.clipboard.writeText(mini.name).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Copied',
        detail: `"${mini.name}" copied to clipboard`,
        life: 2000,
      });
    });
  }

  // Reference links - support all factions/game systems
  getGamesWorkshopUrl(): string {
    const mini = this.miniature();
    if (!mini) return 'https://www.games-workshop.com';
    return `https://www.games-workshop.com/en-GB/searchResults?N=&Ntt=${encodeURIComponent(mini.name)}`;
  }

  getYouTubeSearchUrl(): string {
    const mini = this.miniature();
    if (!mini) return 'https://www.youtube.com';
    const query = `how to paint ${mini.name} ${mini.faction} warhammer`;
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  }

  getPaintTooltip(sectionPaint: { paint?: { brand: string; type: string }; notes?: string }): string {
    const parts = [];
    if (sectionPaint.paint) {
      parts.push(`${sectionPaint.paint.brand} - ${sectionPaint.paint.type}`);
    }
    if (sectionPaint.notes) {
      parts.push(sectionPaint.notes);
    }
    return parts.join('\n');
  }

  getVideoEmbedUrl(tutorial: MiniatureTutorial): SafeResourceUrl | null {
    if (tutorial.platform === 'youtube') {
      const videoId = this.extractYouTubeId(tutorial.videoUrl);
      if (videoId) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.youtube.com/embed/${videoId}`
        );
      }
    } else if (tutorial.platform === 'vimeo') {
      const videoId = this.extractVimeoId(tutorial.videoUrl);
      if (videoId) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://player.vimeo.com/video/${videoId}`
        );
      }
    }
    return null;
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Image dialog methods
  openImageDialog(): void {
    this.imageCaption.set('');
    this.imageUrlInput.set('');
    this.showImageDialog.set(true);
  }

  closeImageDialog(): void {
    this.showImageDialog.set(false);
    this.imageUrlInput.set('');
  }

  onImagePreviewError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    const currentSrc = img.src;

    // Try proxy fallback if we haven't already
    if (!currentSrc.includes('/miniature-images/proxy')) {
      // Find the gallery image with this src and try proxy
      const galleryImg = this.galleryImages().find((g) => g.src === currentSrc);
      if (galleryImg?.proxySrc) {
        img.src = galleryImg.proxySrc;
        return;
      }
    }

    // Show a placeholder for broken images
    img.src =
      'data:image/svg+xml,' +
      encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150">
        <rect fill="#1a1a25" width="200" height="150"/>
        <text x="100" y="70" text-anchor="middle" fill="#5a584f" font-family="sans-serif" font-size="14">Image not found</text>
        <text x="100" y="90" text-anchor="middle" fill="#d93d5c" font-family="sans-serif" font-size="12">Click X to delete</text>
      </svg>
    `);
  }

  // Games Workshop search URL using the warhammer.com PLP endpoint
  getGamesWorkshopSearchUrl(): string {
    const mini = this.miniature();
    if (!mini) return 'https://www.warhammer.com/en-WW/plp';
    return `${GW_SEARCH_URL}${encodeURIComponent(mini.name)}`;
  }

  // Google Image search for painted examples
  getGoogleImageSearchUrl(): string {
    const mini = this.miniature();
    if (!mini) return 'https://images.google.com';
    const query = `${mini.name} ${mini.faction} warhammer painted`;
    return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
  }

  addImageByUrl(): void {
    const url = this.imageUrlInput();
    const mini = this.miniature();

    if (!url || !mini) return;

    this.uploading.set(true);

    this.libraryService
      .addImageByUrl({
        miniatureId: mini.id,
        imageUrl: url,
        caption: this.imageCaption() || undefined,
      })
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Image added successfully',
          });
          this.closeImageDialog();
          this.uploading.set(false);
          this.activeImageIndex = this.images().length - 1;
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Failed to add image',
          });
          this.uploading.set(false);
        },
      });
  }

  // Tutorial dialog methods
  openTutorialDialog(): void {
    this.tutorialTitle.set('');
    this.tutorialUrl.set('');
    this.tutorialAuthor.set('');
    this.tutorialDuration.set(null);
    this.tutorialPlatform.set('youtube');
    this.showTutorialDialog.set(true);
  }

  closeTutorialDialog(): void {
    this.showTutorialDialog.set(false);
  }

  onTutorialUrlChange(): void {
    const url = this.tutorialUrl();
    // Auto-detect platform from URL
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      this.tutorialPlatform.set('youtube');
    } else if (url.includes('vimeo.com')) {
      this.tutorialPlatform.set('vimeo');
    }
  }

  saveTutorial(): void {
    const mini = this.miniature();
    if (!mini) return;

    this.libraryService.addTutorial({
      miniatureId: mini.id,
      title: this.tutorialTitle(),
      videoUrl: this.tutorialUrl(),
      author: this.tutorialAuthor() || undefined,
      duration: this.tutorialDuration() || undefined,
      platform: this.tutorialPlatform() as 'youtube' | 'vimeo' | 'custom',
    });

    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Tutorial added successfully',
    });
    this.closeTutorialDialog();
  }

  private extractYouTubeId(url: string): string | null {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  private extractVimeoId(url: string): string | null {
    const regex = /vimeo\.com\/(\d+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }
}
