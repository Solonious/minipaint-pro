import { ChangeDetectionStrategy, Component, input, output, inject, signal, computed, OnInit, effect } from '@angular/core';
import { Miniature } from '@minipaint-pro/types';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { PointsBadgeComponent } from '../points-badge/points-badge.component';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-mini-card',
  standalone: true,
  imports: [ButtonModule, TooltipModule, ProgressBarModule, PointsBadgeComponent, StatusBadgeComponent],
  template: `
    <div
      class="mini-card"
      [class.dragging]="isDragging()"
      tabindex="0"
      role="article"
    >
      <div class="image-container">
        @if (displayImageUrl()) {
          <img [src]="displayImageUrl()" [alt]="miniature().name" />
        } @else {
          <div class="image-placeholder">
            <i class="pi pi-image"></i>
          </div>
        }
      </div>
      <div class="content">
        <div class="header">
          <h4 class="name">{{ miniature().name }}</h4>
          <app-points-badge [points]="miniature().points" />
        </div>
        <div class="meta">
          <span class="faction">{{ miniature().faction }}</span>
          <span class="model-count" [class.hidden]="miniature().modelCount <= 1">
            {{ miniature().modelsCompleted }}/{{ miniature().modelCount }} models
          </span>
        </div>
        <div class="progress-section" [class.hidden]="!showProgress()">
          <p-progressBar
            [value]="progressPercent()"
            [showValue]="false"
            styleClass="mini-progress"
          />
        </div>
        <div class="footer">
          <app-status-badge [status]="miniature().status" />
          <div class="actions">
            @if (showProgress() && miniature().modelsCompleted < miniature().modelCount) {
              <p-button
                icon="pi pi-plus"
                [rounded]="true"
                [text]="true"
                severity="success"
                size="small"
                pTooltip="Mark one model complete"
                tooltipPosition="top"
                (onClick)="onIncrementClick($event)"
              />
            }
            <p-button
              icon="pi pi-eye"
              [rounded]="true"
              [text]="true"
              severity="secondary"
              size="small"
              pTooltip="View details"
              tooltipPosition="top"
              (onClick)="onViewClick($event)"
            />
            <p-button
              icon="pi pi-pencil"
              [rounded]="true"
              [text]="true"
              severity="secondary"
              size="small"
              pTooltip="Edit"
              tooltipPosition="top"
              (onClick)="onEditClick($event)"
            />
            <p-button
              icon="pi pi-trash"
              [rounded]="true"
              [text]="true"
              severity="danger"
              size="small"
              pTooltip="Delete"
              tooltipPosition="top"
              (onClick)="onDeleteClick($event)"
            />
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .mini-card {
      background: var(--bg-card);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-md);
      overflow: hidden;
      cursor: pointer;
      transition: all var(--transition-fast);
      height: 100%;
    }

    .mini-card:hover {
      border-color: var(--border-glow);
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    .mini-card.dragging {
      opacity: 0.5;
      transform: rotate(3deg);
    }

    .image-container {
      width: 100%;
      height: 120px;
      overflow: hidden;
      background: var(--bg-elevated);
    }

    .image-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-dim);
    }

    .image-placeholder i {
      font-size: 2rem;
    }

    .content {
      padding: var(--space-sm);
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-sm);
    }

    .name {
      font-family: var(--font-display);
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      line-height: 1.2;
      flex: 1;
      min-height: 2.4em;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .meta {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      font-family: var(--font-body);
      font-size: 0.75rem;
      color: var(--text-secondary);
      min-height: 18px;
    }

    .faction {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .model-count {
      flex-shrink: 0;
      padding: 2px var(--space-xs);
      background: var(--bg-elevated);
      border-radius: var(--radius-sm);
      font-size: 0.625rem;

      &.hidden {
        visibility: hidden;
      }
    }

    .progress-section {
      margin-top: var(--space-xs);
      min-height: 4px;
      height: 4px;

      &.hidden {
        visibility: hidden;
      }
    }

    :host ::ng-deep .mini-progress {
      height: 4px;
      background: var(--bg-elevated);
      border-radius: 2px;
    }

    :host ::ng-deep .mini-progress .p-progressbar-value {
      background: var(--gold);
    }

    .footer {
      margin-top: var(--space-xs);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .actions {
      display: flex;
      gap: var(--space-xs);
    }

    .actions :host ::ng-deep .p-button {
      width: 28px;
      height: 28px;
    }

    .actions :host ::ng-deep .p-button-icon {
      font-size: 0.875rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiniCardComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  miniature = input.required<Miniature>();
  isDragging = input<boolean>(false);

  cardClick = output<void>();
  viewClick = output<void>();
  editClick = output<void>();
  incrementClick = output<void>();
  deleteClick = output<void>();

  readonly showProgress = computed(() => this.miniature().modelCount > 1);
  readonly progressPercent = computed(() => {
    const mini = this.miniature();
    if (mini.modelCount <= 1) return 0;
    return Math.round((mini.modelsCompleted / mini.modelCount) * 100);
  });

  private readonly localImageUrl = signal<string | null>(null);

  readonly displayImageUrl = computed(() => {
    // First priority: user-provided imageUrl
    const mini = this.miniature();
    if (mini.imageUrl) {
      return mini.imageUrl;
    }
    // Second priority: locally stored unit image
    return this.localImageUrl();
  });

  constructor() {
    // Fetch local image when miniature changes
    effect(() => {
      const mini = this.miniature();
      if (!mini.imageUrl && mini.gameSystem && mini.faction && mini.name) {
        this.fetchLocalImage(mini);
      }
    });
  }

  ngOnInit(): void {
    // Initial fetch handled by effect
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

    const gameSystem = mini.gameSystem ? gameSystemMap[mini.gameSystem] || mini.gameSystem : 'WARHAMMER_40K';

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

  onViewClick(event: Event): void {
    event.stopPropagation();
    this.viewClick.emit();
  }

  onEditClick(event: Event): void {
    event.stopPropagation();
    this.editClick.emit();
  }

  onIncrementClick(event: Event): void {
    event.stopPropagation();
    this.incrementClick.emit();
  }

  onDeleteClick(event: Event): void {
    event.stopPropagation();
    this.deleteClick.emit();
  }
}
