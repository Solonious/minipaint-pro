import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

export type SkeletonVariant = 'card' | 'mini-card' | 'army-card' | 'paint-card' | 'stat-card' | 'list-item';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [SkeletonModule],
  template: `
    @switch (variant()) {
      @case ('card') {
        <div class="skeleton-card">
          <p-skeleton height="120px" styleClass="skeleton-image" />
          <div class="skeleton-content">
            <p-skeleton width="70%" height="1.25rem" styleClass="skeleton-title" />
            <p-skeleton width="50%" height="0.875rem" />
          </div>
        </div>
      }
      @case ('mini-card') {
        <div class="skeleton-mini-card">
          <div class="skeleton-header">
            <p-skeleton width="60%" height="1rem" />
            <p-skeleton width="40px" height="24px" borderRadius="12px" />
          </div>
          <p-skeleton width="40%" height="0.75rem" />
          <div class="skeleton-footer">
            <p-skeleton width="50px" height="20px" borderRadius="4px" />
            <p-skeleton width="30px" height="0.75rem" />
          </div>
        </div>
      }
      @case ('army-card') {
        <div class="skeleton-army-card">
          <div class="skeleton-army-header">
            <p-skeleton shape="circle" size="48px" />
            <div class="skeleton-army-info">
              <p-skeleton width="70%" height="1.125rem" />
              <p-skeleton width="50%" height="0.875rem" />
            </div>
          </div>
          <div class="skeleton-army-progress">
            <p-skeleton shape="circle" size="80px" />
          </div>
          <div class="skeleton-army-stats">
            <p-skeleton width="100%" height="0.75rem" />
            <p-skeleton width="60%" height="0.75rem" />
          </div>
        </div>
      }
      @case ('paint-card') {
        <div class="skeleton-paint-card">
          <p-skeleton width="100%" height="60px" styleClass="skeleton-swatch" />
          <div class="skeleton-paint-info">
            <p-skeleton width="80%" height="0.875rem" />
            <p-skeleton width="50%" height="0.75rem" />
          </div>
        </div>
      }
      @case ('stat-card') {
        <div class="skeleton-stat-card">
          <p-skeleton width="40%" height="0.75rem" />
          <p-skeleton width="60%" height="2rem" />
          <p-skeleton width="80%" height="0.625rem" />
        </div>
      }
      @case ('list-item') {
        <div class="skeleton-list-item">
          <p-skeleton shape="circle" size="32px" />
          <div class="skeleton-list-content">
            <p-skeleton width="70%" height="1rem" />
            <p-skeleton width="40%" height="0.75rem" />
          </div>
        </div>
      }
    }
  `,
  styles: `
    :host {
      display: block;
    }

    .skeleton-card {
      background: var(--bg-card);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .skeleton-content {
      padding: var(--space-md);
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }

    .skeleton-mini-card {
      background: var(--bg-card);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-md);
      padding: var(--space-md);
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }

    .skeleton-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .skeleton-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: var(--space-xs);
    }

    .skeleton-army-card {
      background: var(--bg-card);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-lg);
      padding: var(--space-lg);
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }

    .skeleton-army-header {
      display: flex;
      align-items: center;
      gap: var(--space-md);
    }

    .skeleton-army-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }

    .skeleton-army-progress {
      display: flex;
      justify-content: center;
      padding: var(--space-md) 0;
    }

    .skeleton-army-stats {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }

    .skeleton-paint-card {
      background: var(--bg-card);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .skeleton-paint-info {
      padding: var(--space-sm);
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }

    .skeleton-stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-md);
      padding: var(--space-lg);
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }

    .skeleton-list-item {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-sm) 0;
    }

    .skeleton-list-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }

    :host ::ng-deep .p-skeleton {
      background-color: var(--bg-elevated);

      &::after {
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.04),
          transparent
        );
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSkeletonComponent {
  variant = input<SkeletonVariant>('card');
}
