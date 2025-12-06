import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ArmyWithProgress } from '@minipaint-pro/types';
import { ProgressRingComponent } from '../progress-ring/progress-ring.component';
import { PointsBadgeComponent } from '../points-badge/points-badge.component';

const GAME_SYSTEM_LABELS: Record<string, string> = {
  warhammer40k: 'Warhammer 40K',
  ageOfSigmar: 'Age of Sigmar',
  killTeam: 'Kill Team',
  necromunda: 'Necromunda',
  horusHeresy: 'Horus Heresy',
  other: 'Other',
};

@Component({
  selector: 'app-army-card',
  standalone: true,
  imports: [ProgressRingComponent, PointsBadgeComponent],
  template: `
    <div
      class="army-card"
      tabindex="0"
      role="button"
      (click)="cardClick.emit()"
      (keydown.enter)="cardClick.emit()"
      (keydown.space)="cardClick.emit()"
    >
      <div class="icon-section" [style.background-color]="army().colorHex || 'var(--bg-elevated)'">
        @if (army().iconEmoji) {
          <img
            class="faction-icon"
            [src]="'assets/icons/factions/' + army().iconEmoji + '.svg'"
            [alt]="army().faction + ' icon'"
          />
        } @else {
          <span class="placeholder">{{ initials() }}</span>
        }
      </div>
      <div class="content">
        <div class="header">
          <h3 class="name">{{ army().name }}</h3>
          <app-progress-ring
            [value]="army().progressPercentage"
            [size]="48"
            [strokeWidth]="4"
          />
        </div>
        <div class="meta">
          <span class="faction">{{ army().faction }}</span>
          <span class="system">{{ gameSystemLabel() }}</span>
        </div>
        <div class="stats">
          <div class="stat">
            <span class="stat-value">{{ army().completedCount }}</span>
            <span class="stat-label">/ {{ army().miniatureCount }} painted</span>
          </div>
          <div class="points">
            <app-points-badge [points]="army().currentPoints" />
            <span class="target-points">/ {{ army().targetPoints }} pts</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }

    .army-card {
      display: flex;
      height: 100%;
      background: var(--bg-card);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-lg);
      overflow: hidden;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .army-card:hover {
      border-color: var(--gold);
      box-shadow: var(--shadow-glow);
      transform: translateY(-2px);
    }

    .icon-section {
      width: 80px;
      min-height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      align-self: stretch;
    }

    .faction-icon {
      width: 48px;
      height: 48px;
      object-fit: contain;
      filter: brightness(0) invert(1);
      opacity: 0.9;
    }

    .placeholder {
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-dim);
    }

    .content {
      flex: 1;
      padding: var(--space-md);
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-md);
    }

    .name {
      font-family: var(--font-display);
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      line-height: 1.2;
    }

    .meta {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      font-family: var(--font-body);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .faction {
      color: var(--gold);
    }

    .system {
      color: var(--text-secondary);
    }

    .stats {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
    }

    .stat {
      font-family: var(--font-mono);
      font-size: 0.75rem;
    }

    .stat-value {
      font-weight: 700;
      color: var(--success);
    }

    .stat-label {
      color: var(--text-secondary);
    }

    .points {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
    }

    .target-points {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--text-secondary);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArmyCardComponent {
  army = input.required<ArmyWithProgress>();

  cardClick = output<void>();

  gameSystemLabel = computed(() => GAME_SYSTEM_LABELS[this.army().gameSystem] || this.army().gameSystem);
  initials = computed(() => {
    const words = this.army().name.split(' ');
    return words
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  });
}
