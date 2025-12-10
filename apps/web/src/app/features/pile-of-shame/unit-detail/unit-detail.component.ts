import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { Miniature } from '@minipaint-pro/types';
import { MiniatureService } from '../../../core/services/miniature.service';
import { AdminService } from '../../../core/services/admin.service';
import { ArmyService } from '../../../core/services/army.service';
import { PageLoaderComponent } from '../../../shared/components/loading-skeleton/page-loader.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PointsBadgeComponent } from '../../../shared/components/points-badge/points-badge.component';

@Component({
  selector: 'app-unit-detail',
  standalone: true,
  imports: [
    ButtonModule,
    TooltipModule,
    TagModule,
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
            pTooltip="Back to Pile of Shame"
            aria-label="Back to Pile of Shame"
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

          <div class="header-actions">
            <button
              pButton
              icon="pi pi-pencil"
              class="p-button-outlined"
              pTooltip="Edit"
              (click)="editMiniature()"
            ></button>
          </div>
        </header>

        <div class="detail-content">
          <!-- Image Section -->
          <section class="image-section">
            @if (displayImageUrl()) {
              <div class="main-image">
                <img [src]="displayImageUrl()" [alt]="miniature()!.name" />
              </div>
            } @else {
              <div class="empty-image">
                <i class="pi pi-image"></i>
                <p>No image available</p>
              </div>
            }
          </section>

          <!-- Details Section -->
          <section class="details-section">
            <h2><i class="pi pi-info-circle"></i> Details</h2>
            <div class="details-grid">
              <div class="detail-item">
                <span class="label">Game System</span>
                <span class="value">{{ formatGameSystem(miniature()!.gameSystem) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Faction</span>
                <span class="value">{{ miniature()!.faction }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Status</span>
                <span class="value"><app-status-badge [status]="miniature()!.status" /></span>
              </div>
              <div class="detail-item">
                <span class="label">Points</span>
                <span class="value">{{ miniature()!.points }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Model Count</span>
                <span class="value">{{ miniature()!.modelCount }}</span>
              </div>
              @if (miniature()!.cost) {
                <div class="detail-item">
                  <span class="label">Cost</span>
                  <span class="value">\${{ miniature()!.cost }}</span>
                </div>
              }
              @if (armyName()) {
                <div class="detail-item">
                  <span class="label">Army</span>
                  <span class="value">{{ armyName() }}</span>
                </div>
              }
            </div>
          </section>

          <!-- Notes Section -->
          @if (miniature()!.notes) {
            <section class="notes-section">
              <h2><i class="pi pi-file-edit"></i> Notes</h2>
              <p class="notes-content">{{ miniature()!.notes }}</p>
            </section>
          }

          <!-- Timestamps -->
          <section class="timestamps-section">
            <div class="timestamp">
              <span class="label">Created</span>
              <span class="value">{{ formatDate(miniature()!.createdAt) }}</span>
            </div>
            <div class="timestamp">
              <span class="label">Updated</span>
              <span class="value">{{ formatDate(miniature()!.updatedAt) }}</span>
            </div>
          </section>
        </div>
      } @else {
        <div class="not-found">
          <i class="pi pi-exclamation-circle"></i>
          <p>Miniature not found</p>
          <button pButton label="Back to Pile of Shame" (click)="goBack()"></button>
        </div>
      }
    </div>
  `,
  styles: [`
    .detail-container {
      padding: var(--space-lg);
      max-width: 1000px;
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

      .header-actions {
        display: flex;
        gap: var(--space-sm);
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

    .image-section {
      .main-image {
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-elevated);
        border-radius: var(--radius-md);
        overflow: hidden;

        img {
          max-width: 100%;
          max-height: 400px;
          object-fit: contain;
        }
      }

      .empty-image {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--space-xxl);
        background: var(--bg-elevated);
        border-radius: var(--radius-md);
        color: var(--text-dim);

        i {
          font-size: 3rem;
          margin-bottom: var(--space-md);
        }

        p {
          margin: 0;
        }
      }
    }

    .details-section {
      .details-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: var(--space-md);
      }

      .detail-item {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);

        .label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-dim);
        }

        .value {
          font-size: 1rem;
          color: var(--text-primary);
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

    .timestamps-section {
      display: flex;
      gap: var(--space-xl);
      background: transparent;
      border: none;
      padding: 0;

      .timestamp {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);

        .label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-dim);
        }

        .value {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
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
export class UnitDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly miniatureService = inject(MiniatureService);
  private readonly adminService = inject(AdminService);
  private readonly armyService = inject(ArmyService);

  readonly loading = signal(true);
  readonly miniature = signal<Miniature | null>(null);
  readonly localImageUrl = signal<string | null>(null);

  readonly displayImageUrl = computed(() => {
    const mini = this.miniature();
    if (mini?.imageUrl) {
      return mini.imageUrl;
    }
    return this.localImageUrl();
  });

  readonly armyName = computed(() => {
    const mini = this.miniature();
    if (!mini?.armyId) {
      return null;
    }
    const army = this.armyService.getById(mini.armyId);
    return army?.name ?? null;
  });

  ngOnInit(): void {
    // Ensure data is loaded before accessing
    this.miniatureService.loadAll();
    this.armyService.loadAll();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMiniature(id);
    } else {
      this.loading.set(false);
    }
  }

  private loadMiniature(id: string): void {
    this.loading.set(true);
    const miniatures = this.miniatureService.miniatures();
    const found = miniatures.find((m) => m.id === id);

    if (found) {
      this.miniature.set(found);
      this.fetchLocalImage(found);
    }

    this.loading.set(false);
  }

  private fetchLocalImage(mini: Miniature): void {
    const gameSystemMap: Record<string, string> = {
      warhammer40k: 'WARHAMMER_40K',
      ageOfSigmar: 'AGE_OF_SIGMAR',
      killTeam: 'KILL_TEAM',
      necromunda: 'NECROMUNDA',
      horusHeresy: 'HORUS_HERESY',
      other: 'OTHER',
    };

    const gameSystem = mini.gameSystem
      ? gameSystemMap[mini.gameSystem] || mini.gameSystem
      : 'WARHAMMER_40K';

    this.adminService
      .getUnitImageUrl(gameSystem, mini.faction, mini.name)
      .then((url) => {
        if (url) {
          this.localImageUrl.set(url);
        }
      })
      .catch(() => {
        // Silently fail - no image available
      });
  }

  goBack(): void {
    this.router.navigate(['/pile']);
  }

  editMiniature(): void {
    // Navigate back to pile and trigger edit dialog
    // For now, just go back - we can enhance this later
    this.router.navigate(['/pile'], {
      queryParams: { edit: this.miniature()?.id },
    });
  }

  formatGameSystem(gameSystem?: string): string {
    const gameSystemLabels: Record<string, string> = {
      warhammer40k: 'Warhammer 40K',
      ageOfSigmar: 'Age of Sigmar',
      killTeam: 'Kill Team',
      necromunda: 'Necromunda',
      horusHeresy: 'Horus Heresy',
      other: 'Other',
    };
    return gameSystem ? gameSystemLabels[gameSystem] || gameSystem : 'Unknown';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
