import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MiniatureStatus } from '@minipaint-pro/types';

const STATUS_CONFIG: Record<MiniatureStatus, { label: string; color: string }> = {
  unbuilt: { label: 'Unbuilt', color: 'var(--status-unbuilt)' },
  assembled: { label: 'Assembled', color: 'var(--status-assembled)' },
  primed: { label: 'Primed', color: 'var(--status-primed)' },
  wip: { label: 'WIP', color: 'var(--status-wip)' },
  painted: { label: 'Painted', color: 'var(--status-painted)' },
  complete: { label: 'Complete', color: 'var(--status-complete)' },
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span class="status-badge">
      <span class="dot" [style.background-color]="config().color"></span>
      <span class="label">{{ config().label }}</span>
    </span>
  `,
  styles: `
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--space-sm);
      font-family: var(--font-body);
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .label {
      line-height: 1;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  status = input.required<MiniatureStatus>();

  config = computed(() => STATUS_CONFIG[this.status()]);
}
