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
      [class.wishlist]="paint().wishlist"
      (click)="cardClick.emit()"
    >
      <div class="swatch" [style.background-color]="paint().colorHex">
        @if (paint().owned) {
          <span class="owned-indicator" title="Owned">&#10003;</span>
        }
        @if (paint().wishlist && !paint().owned) {
          <span class="wishlist-indicator" title="Wishlist">&#9825;</span>
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
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .paint-card:hover {
      border-color: var(--border-glow);
      transform: translateY(-2px);
    }

    .paint-card.owned {
      border-color: var(--success);
    }

    .paint-card.wishlist:not(.owned) {
      border-color: var(--info);
    }

    .swatch {
      position: relative;
      height: 60px;
      width: 100%;
    }

    .owned-indicator,
    .wishlist-indicator {
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
      font-family: 'Rajdhani', sans-serif;
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
      font-family: 'Rajdhani', sans-serif;
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

  brandLabel = computed(() => BRAND_LABELS[this.paint().brand] || this.paint().brand);
  typeLabel = computed(() => TYPE_LABELS[this.paint().type] || this.paint().type);
}
