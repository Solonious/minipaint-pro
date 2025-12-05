import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-goal-progress',
  standalone: true,
  template: `
    <div class="goal-progress">
      <div class="header">
        <span class="label">{{ label() }}</span>
        <span class="values">
          <span class="current">{{ current() }}</span>
          <span class="separator">/</span>
          <span class="target">{{ target() }}</span>
        </span>
      </div>
      <div class="bar-container">
        <div
          class="bar-fill"
          [style.width.%]="percentage()"
          [class.complete]="isComplete()"
        ></div>
      </div>
    </div>
  `,
  styles: `
    .goal-progress {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .label {
      font-family: 'Rajdhani', sans-serif;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .values {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
    }

    .current {
      color: var(--gold);
      font-weight: 700;
    }

    .separator {
      color: var(--text-dim);
      margin: 0 2px;
    }

    .target {
      color: var(--text-secondary);
    }

    .bar-container {
      height: 6px;
      background: var(--border-dim);
      border-radius: var(--radius-sm);
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--gold) 0%, var(--gold-bright) 100%);
      border-radius: var(--radius-sm);
      transition: width var(--transition-base);
    }

    .bar-fill.complete {
      background: linear-gradient(90deg, var(--success) 0%, #7bc992 100%);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalProgressComponent {
  label = input.required<string>();
  current = input.required<number>();
  target = input.required<number>();

  percentage = computed(() => Math.min((this.current() / this.target()) * 100, 100));
  isComplete = computed(() => this.current() >= this.target());
}
