import { Component, OnInit, OnDestroy, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { GalleriaModule } from 'primeng/galleria';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MiniatureLibraryService } from '../../../core/services/miniature-library.service';
import { PageLoaderComponent } from '../../../shared/components/loading-skeleton/page-loader.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PointsBadgeComponent } from '../../../shared/components/points-badge/points-badge.component';
import { MiniatureTutorial } from '@minipaint-pro/types';

@Component({
  selector: 'app-miniature-detail',
  standalone: true,
  imports: [
    ButtonModule,
    GalleriaModule,
    TagModule,
    TooltipModule,
    PageLoaderComponent,
    StatusBadgeComponent,
    PointsBadgeComponent,
  ],
  template: `
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
            <h1>{{ miniature()!.name }}</h1>
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
            <h2><i class="pi pi-images"></i> Images</h2>
            @if (images().length > 0) {
              <p-galleria
                [value]="galleryImages()"
                [showThumbnails]="true"
                [showIndicators]="true"
                [showItemNavigators]="true"
                [responsiveOptions]="responsiveOptions"
                [containerStyle]="{ 'max-width': '100%' }"
              >
                <ng-template #item let-item>
                  <div class="gallery-item">
                    <img [src]="item.src" [alt]="item.alt" />
                    @if (item.caption) {
                      <div class="image-caption">{{ item.caption }}</div>
                    }
                  </div>
                </ng-template>
                <ng-template #thumbnail let-item>
                  <img [src]="item.src" [alt]="item.alt" class="thumbnail" />
                </ng-template>
              </p-galleria>
            } @else {
              <div class="empty-section">
                <i class="pi pi-image"></i>
                <p>No images yet</p>
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

          <!-- Tutorial Videos -->
          <section class="tutorials-section">
            <h2><i class="pi pi-youtube"></i> Tutorial Videos</h2>
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
                      @if (tutorial.author) {
                        <span class="author">by {{ tutorial.author }}</span>
                      }
                      @if (tutorial.duration) {
                        <span class="duration">{{ formatDuration(tutorial.duration) }}</span>
                      }
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="empty-section">
                <i class="pi pi-video"></i>
                <p>No tutorial videos</p>
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
  `,
  styles: [`
    .detail-container {
      padding: var(--space-lg);
      max-width: 1200px;
      margin: 0 auto;
    }

    .detail-header {
      display: flex;
      align-items: flex-start;
      gap: var(--space-md);
      margin-bottom: var(--space-xl);
      padding-bottom: var(--space-lg);
      border-bottom: 1px solid var(--border-dim);

      .back-button {
        margin-top: var(--space-xs);
      }

      .header-content {
        flex: 1;

        h1 {
          font-family: var(--font-display);
          font-size: 2rem;
          color: var(--gold);
          margin: 0 0 var(--space-sm) 0;
        }

        .header-meta {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          flex-wrap: wrap;

          .faction {
            color: var(--text-secondary);
            font-weight: 500;
          }

          .model-count {
            color: var(--text-dim);
            font-size: 0.875rem;
          }
        }
      }
    }

    .detail-content {
      display: flex;
      flex-direction: column;
      gap: var(--space-xl);
    }

    section {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      padding: var(--space-lg);
      border: 1px solid var(--border-dim);

      h2 {
        font-family: var(--font-display);
        font-size: 1.25rem;
        color: var(--text-primary);
        margin: 0 0 var(--space-md) 0;
        display: flex;
        align-items: center;
        gap: var(--space-sm);

        i {
          color: var(--gold);
        }
      }
    }

    .gallery-section {
      .gallery-item {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-elevated);
        border-radius: var(--radius-md);
        overflow: hidden;

        img {
          max-width: 100%;
          max-height: 500px;
          object-fit: contain;
        }

        .image-caption {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: var(--space-sm) var(--space-md);
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
          color: var(--text-primary);
          font-size: 0.875rem;
        }
      }

      .thumbnail {
        width: 80px;
        height: 60px;
        object-fit: cover;
        border-radius: var(--radius-sm);
      }
    }

    .scheme-section {
      .scheme-name {
        color: var(--text-secondary);
        margin-bottom: var(--space-md);
        font-style: italic;
      }

      .sections-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
      }

      .scheme-section-item {
        h4 {
          font-family: var(--font-display);
          color: var(--gold-bright);
          margin: 0 0 var(--space-sm) 0;
          font-size: 1rem;
        }

        .paints-row {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-sm);
        }

        .paint-swatch {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: var(--space-xs) var(--space-sm);
          background: var(--bg-elevated);
          border-radius: var(--radius-sm);
          cursor: default;

          .swatch-color {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid var(--border-glow);
          }

          .paint-name {
            font-size: 0.875rem;
            color: var(--text-primary);
          }

          .technique {
            font-size: 0.75rem;
            color: var(--text-dim);
            background: var(--bg-panel);
            padding: 2px 6px;
            border-radius: var(--radius-xs);
          }
        }
      }
    }

    .tutorials-section {
      .tutorials-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: var(--space-md);
      }

      .tutorial-card {
        background: var(--bg-elevated);
        border-radius: var(--radius-md);
        overflow: hidden;

        .video-embed {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;

          iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }
        }

        .tutorial-info {
          padding: var(--space-md);

          h4 {
            margin: 0 0 var(--space-xs) 0;
            font-size: 1rem;
            color: var(--text-primary);
          }

          .author, .duration {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin-right: var(--space-sm);
          }
        }
      }
    }

    .notes-section {
      .notes-content {
        color: var(--text-secondary);
        line-height: 1.6;
        white-space: pre-wrap;
        margin: 0;
      }
    }

    .empty-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--space-xl);
      color: var(--text-dim);

      i {
        font-size: 2rem;
        margin-bottom: var(--space-sm);
      }

      p {
        margin: 0;
      }
    }

    .not-found {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-xxl);
      color: var(--text-secondary);

      i {
        font-size: 3rem;
        margin-bottom: var(--space-md);
        color: var(--error);
      }

      p {
        font-size: 1.25rem;
        margin: 0 0 var(--space-lg) 0;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiniatureDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly libraryService = inject(MiniatureLibraryService);

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

  readonly galleryImages = computed(() => {
    return this.images().map((img) => ({
      src: this.libraryService.getImageUrl(img.filename),
      alt: img.caption || img.originalName,
      caption: img.caption,
      type: img.imageType,
    }));
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
