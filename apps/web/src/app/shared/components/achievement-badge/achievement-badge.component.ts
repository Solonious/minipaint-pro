import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-achievement-badge',
  standalone: true,
  template: `
    <div class="achievement-badge" [class.unlocked]="unlocked()" [title]="name()">
      <span class="emoji">{{ emoji() }}</span>
      @if (showName()) {
        <span class="name">{{ name() }}</span>
      }
    </div>
  `,
  styles: `
    .achievement-badge {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-xs);
      padding: var(--space-sm);
      border-radius: var(--radius-md);
      background: var(--bg-card);
      border: 1px solid var(--border-dim);
      filter: grayscale(100%);
      opacity: 0.5;
      transition: all var(--transition-base);
    }

    .achievement-badge.unlocked {
      filter: grayscale(0%);
      opacity: 1;
      border-color: var(--gold);
      box-shadow: var(--shadow-glow);
    }

    .emoji {
      font-size: 1.5rem;
      line-height: 1;
    }

    .name {
      font-family: var(--font-body);
      font-size: 0.625rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
      text-align: center;
      max-width: 60px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .achievement-badge.unlocked .name {
      color: var(--gold);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AchievementBadgeComponent {
  emoji = input.required<string>();
  name = input.required<string>();
  unlocked = input<boolean>(false);
  showName = input<boolean>(true);
}
