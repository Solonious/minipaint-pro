import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { PaintWithOwnership } from '@minipaint-pro/types';

const BRAND_LABELS: Record<string, string> = {
  citadel: 'Citadel',
  vallejo: 'Vallejo',
  armyPainter: 'Army Painter',
  scale75: 'Scale75',
  akInteractive: 'AK Interactive',
  turboDork: 'Turbo Dork',
  other: 'Other',
};

const TYPE_LABELS: Record<string, string> = {
  base: 'Base',
  layer: 'Layer',
  shade: 'Shade',
  contrast: 'Contrast',
  technical: 'Technical',
  dry: 'Dry',
  air: 'Air',
  metallic: 'Metallic',
};

@Component({
  selector: 'app-paint-card',
  standalone: true,
  template: `
    <div
      class="paint-card"
      [class.owned]="paint().owned"
      [class.wishlist]="paint().wishlist && !paint().owned"
    >
      <div class="swatch" [style.background-color]="paint().colorHex">
        <div class="swatch-actions">
          <button
            type="button"
            class="action-btn owned-btn"
            [class.active]="paint().owned"
            [title]="paint().owned ? 'Remove from owned' : 'Mark as owned'"
            (click)="onToggleOwned($event)"
          >
            <span class="icon">&#10003;</span>
          </button>
          <button
            type="button"
            class="action-btn wishlist-btn"
            [class.active]="paint().wishlist && !paint().owned"
            [class.disabled]="paint().owned"
            [title]="paint().owned ? 'Already owned' : (paint().wishlist ? 'Remove from wishlist' : 'Add to wishlist')"
            (click)="onToggleWishlist($event)"
            [disabled]="paint().owned"
          >
            <span class="icon">&#9825;</span>
          </button>
        </div>
        @if (paint().owned) {
          <span class="status-indicator owned-indicator">&#10003;</span>
        }
        @if (paint().wishlist && !paint().owned) {
          <span class="status-indicator wishlist-indicator">&#9825;</span>
        }
      </div>
      <div class="info">
        <span class="name">{{ paint().name }}</span>
        <div class="meta">
          <span class="brand">{{ brandLabel() }}</span>
          <span class="type">{{ typeLabel() }}</span>
        </div>
      </div>
    </div>
  `,
  styles: `
    .paint-card {
      display: flex;
      flex-direction: column;
      background: var(--bg-card);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-md);
      overflow: hidden;
      transition: all var(--transition-fast);
    }

    .paint-card:hover {
      border-color: var(--border-glow);
      transform: translateY(-2px);
    }

    .paint-card.owned {
      border-color: var(--success);
    }

    .paint-card.wishlist {
      border-color: var(--info);
    }

    .swatch {
      position: relative;
      height: 60px;
      width: 100%;
    }

    .swatch-actions {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-sm);
      opacity: 0;
      background: rgba(0, 0, 0, 0.5);
      transition: opacity var(--transition-fast);
    }

    .paint-card:hover .swatch-actions {
      opacity: 1;
    }

    .action-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.5);
      background: rgba(0, 0, 0, 0.3);
      color: rgba(255, 255, 255, 0.8);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      transition: all var(--transition-fast);
    }

    .action-btn:hover:not(.disabled) {
      transform: scale(1.1);
    }

    .action-btn.owned-btn:hover:not(.disabled),
    .action-btn.owned-btn.active {
      background: var(--success);
      border-color: var(--success);
      color: white;
    }

    .action-btn.wishlist-btn:hover:not(.disabled),
    .action-btn.wishlist-btn.active {
      background: var(--info);
      border-color: var(--info);
      color: white;
    }

    .action-btn.disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .status-indicator {
      position: absolute;
      top: var(--space-xs);
      right: var(--space-xs);
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: bold;
      pointer-events: none;
    }

    .paint-card:hover .status-indicator {
      opacity: 0;
    }

    .owned-indicator {
      background: var(--success);
      color: var(--bg-void);
    }

    .wishlist-indicator {
      background: var(--info);
      color: white;
    }

    .info {
      padding: var(--space-sm);
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }

    .name {
      font-family: var(--font-body);
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-primary);
      line-height: 1.2;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .meta {
      display: flex;
      justify-content: space-between;
      font-family: var(--font-body);
      font-size: 0.6875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .brand {
      color: var(--text-secondary);
    }

    .type {
      color: var(--text-dim);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaintCardComponent {
  paint = input.required<PaintWithOwnership>();

  cardClick = output<void>();
  toggleOwned = output<string>();
  toggleWishlist = output<string>();

  brandLabel = computed(() => BRAND_LABELS[this.paint().brand] || this.paint().brand);
  typeLabel = computed(() => TYPE_LABELS[this.paint().type] || this.paint().type);

  onToggleOwned(event: Event): void {
    event.stopPropagation();
    this.toggleOwned.emit(this.paint().id);
  }

  onToggleWishlist(event: Event): void {
    event.stopPropagation();
    if (!this.paint().owned) {
      this.toggleWishlist.emit(this.paint().id);
    }
  }
}
