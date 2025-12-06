import { ChangeDetectionStrategy, Component, input, output, inject, signal, computed, OnInit, effect } from '@angular/core';
import { Miniature } from '@minipaint-pro/types';
import { PointsBadgeComponent } from '../points-badge/points-badge.component';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-mini-card',
  standalone: true,
  imports: [PointsBadgeComponent, StatusBadgeComponent],
  template: `
    <div
      class="mini-card"
      [class.dragging]="isDragging()"
      tabindex="0"
      role="button"
      (click)="cardClick.emit()"
      (keydown.enter)="cardClick.emit()"
      (keydown.space)="cardClick.emit()"
    >
      @if (displayImageUrl()) {
        <div class="image-container">
          <img [src]="displayImageUrl()" [alt]="miniature().name" />
        </div>
      }
      <div class="content">
        <div class="header">
          <h4 class="name">{{ miniature().name }}</h4>
          <app-points-badge [points]="miniature().points" />
        </div>
        <div class="meta">
          <span class="faction">{{ miniature().faction }}</span>
          @if (miniature().modelCount > 1) {
            <span class="model-count">{{ miniature().modelCount }} models</span>
          }
        </div>
        <div class="footer">
          <app-status-badge [status]="miniature().status" />
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
    }

    .meta {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      font-family: var(--font-body);
      font-size: 0.75rem;
      color: var(--text-secondary);
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
    }

    .footer {
      margin-top: var(--space-xs);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiniCardComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  miniature = input.required<Miniature>();
  isDragging = input<boolean>(false);

  cardClick = output<void>();

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
}
