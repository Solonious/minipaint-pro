import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-points-badge',
  standalone: true,
  template: `
    <span class="points-badge" [class.large]="size() === 'large'">
      <span class="value">{{ points() }}</span>
      <span class="label">pts</span>
    </span>
  `,
  styles: `
    .points-badge {
      display: inline-flex;
      align-items: baseline;
      gap: var(--space-xs);
      padding: var(--space-xs) var(--space-sm);
      background: linear-gradient(135deg, var(--gold) 0%, var(--gold-bright) 100%);
      border-radius: var(--radius-sm);
      font-family: 'JetBrains Mono', monospace;
    }

    .value {
      font-weight: 700;
      font-size: 0.875rem;
      color: var(--bg-void);
    }

    .label {
      font-size: 0.625rem;
      font-weight: 500;
      color: var(--bg-panel);
      text-transform: uppercase;
    }

    .points-badge.large {
      padding: var(--space-sm) var(--space-md);

      .value {
        font-size: 1.25rem;
      }

      .label {
        font-size: 0.75rem;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PointsBadgeComponent {
  points = input.required<number>();
  size = input<'small' | 'large'>('small');
}
