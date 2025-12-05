import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Miniature } from '@minipaint-pro/types';
import { PointsBadgeComponent } from '../points-badge/points-badge.component';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

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
      @if (miniature().imageUrl) {
        <div class="image-container">
          <img [src]="miniature().imageUrl" [alt]="miniature().name" />
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
      font-family: 'Cinzel', serif;
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
      font-family: 'Rajdhani', sans-serif;
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
export class MiniCardComponent {
  miniature = input.required<Miniature>();
  isDragging = input<boolean>(false);

  cardClick = output<void>();
}
