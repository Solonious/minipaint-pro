import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-progress-ring',
  standalone: true,
  template: `
    <div class="progress-ring" [style.width.px]="size()" [style.height.px]="size()">
      <svg [attr.viewBox]="'0 0 ' + size() + ' ' + size()">
        <circle
          class="track"
          [attr.cx]="center()"
          [attr.cy]="center()"
          [attr.r]="radius()"
          [attr.stroke-width]="strokeWidth()"
          fill="none"
        />
        <circle
          class="progress"
          [attr.cx]="center()"
          [attr.cy]="center()"
          [attr.r]="radius()"
          [attr.stroke-width]="strokeWidth()"
          [attr.stroke-dasharray]="circumference()"
          [attr.stroke-dashoffset]="dashOffset()"
          [style.stroke]="color()"
          fill="none"
        />
      </svg>
      @if (showValue()) {
        <div class="value">
          <span class="number">{{ percentage() }}</span>
          <span class="percent">%</span>
        </div>
      }
    </div>
  `,
  styles: `
    .progress-ring {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    svg {
      transform: rotate(-90deg);
      width: 100%;
      height: 100%;
    }

    .track {
      stroke: var(--border-dim);
    }

    .progress {
      stroke-linecap: round;
      transition: stroke-dashoffset var(--transition-base);
    }

    .value {
      position: absolute;
      display: flex;
      align-items: baseline;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-primary);
    }

    .number {
      font-weight: 700;
      font-size: 1rem;
    }

    .percent {
      font-size: 0.625rem;
      color: var(--text-secondary);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressRingComponent {
  value = input.required<number>();
  max = input<number>(100);
  size = input<number>(80);
  strokeWidth = input<number>(6);
  color = input<string>('var(--gold)');
  showValue = input<boolean>(true);

  center = computed(() => this.size() / 2);
  radius = computed(() => (this.size() - this.strokeWidth()) / 2);
  circumference = computed(() => 2 * Math.PI * this.radius());
  percentage = computed(() => Math.round((this.value() / this.max()) * 100));
  dashOffset = computed(() => {
    const progress = Math.min(this.value() / this.max(), 1);
    return this.circumference() * (1 - progress);
  });
}
