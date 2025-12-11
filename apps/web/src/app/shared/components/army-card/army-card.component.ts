import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { ArmyWithProgress } from '@minipaint-pro/types';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressRingComponent } from '../progress-ring/progress-ring.component';
import { PointsBadgeComponent } from '../points-badge/points-badge.component';
import { FactionImageService } from '../../../core/services/faction-image.service';

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
  imports: [ButtonModule, TooltipModule, ProgressRingComponent, PointsBadgeComponent],
  template: `
    <div
      class="army-card"
      tabindex="0"
      role="article"
      (click)="onCardClick()"
    >
      <!-- Hero Image Section -->
      <div
        class="hero-section"
        [style.background-image]="heroBackground()"
        [style.background-color]="army().colorHex || 'var(--bg-elevated)'"
      >
        <div class="hero-overlay"></div>
        <div class="hero-content">
          @if (army().iconEmoji) {
            <img
              class="faction-icon"
              [src]="'assets/icons/factions/' + army().iconEmoji + '.svg'"
              [alt]="army().faction + ' icon'"
            />
          }
          <div class="hero-text">
            <h3 class="name">{{ army().name }}</h3>
            <div class="meta">
              <span class="faction">{{ army().faction }}</span>
              <span class="separator">•</span>
              <span class="system">{{ gameSystemLabel() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Section -->
      <div class="progress-section">
        <div class="progress-ring-wrapper">
          <app-progress-ring
            [value]="army().progressPercentage"
            [size]="80"
            [strokeWidth]="6"
          />
        </div>
        <div class="progress-details">
          <div class="progress-stat">
            <span class="stat-value painted">{{ army().completedCount }}</span>
            <span class="stat-label">/ {{ army().miniatureCount }} units painted</span>
          </div>
          <div class="progress-stat">
            <app-points-badge [points]="army().currentPoints" size="large" />
            <span class="stat-label">/ {{ army().targetPoints }} pts</span>
          </div>
        </div>
      </div>

      <!-- Actions Section -->
      <div class="actions-section">
        <p-button
          label="View Details"
          icon="pi pi-eye"
          [outlined]="true"
          severity="secondary"
          size="small"
          pTooltip="View army details"
          tooltipPosition="top"
          (onClick)="onViewClick($event)"
        />
        <p-button
          icon="pi pi-pencil"
          [rounded]="true"
          [text]="true"
          severity="secondary"
          size="small"
          pTooltip="Edit army"
          tooltipPosition="top"
          (onClick)="onEditClick($event)"
        />
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
      flex-direction: column;
      height: 100%;
      min-height: 360px;
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
      transform: translateY(-4px);
    }

    .army-card:hover .hero-overlay {
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.3) 0%,
        rgba(0, 0, 0, 0.7) 100%
      );
    }

    /* Hero Section */
    .hero-section {
      position: relative;
      height: 180px;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.2) 0%,
        rgba(0, 0, 0, 0.8) 100%
      );
      transition: background var(--transition-fast);
    }

    .hero-content {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: flex-end;
      gap: var(--space-md);
      padding: var(--space-lg);
    }

    .faction-icon {
      width: 56px;
      height: 56px;
      object-fit: contain;
      filter: brightness(0) invert(1);
      opacity: 0.95;
      flex-shrink: 0;
    }

    .hero-text {
      flex: 1;
      min-width: 0;
    }

    .name {
      font-family: var(--font-display);
      font-size: 1.375rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      line-height: 1.2;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .meta {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
      margin-top: var(--space-xs);
      font-family: var(--font-body);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .faction {
      color: var(--gold-bright);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }

    .separator {
      color: var(--text-dim);
    }

    .system {
      color: rgba(255, 255, 255, 0.7);
    }

    /* Progress Section */
    .progress-section {
      flex: 1;
      display: flex;
      align-items: center;
      gap: var(--space-lg);
      padding: var(--space-lg);
      background: var(--bg-card);
    }

    .progress-ring-wrapper {
      flex-shrink: 0;
    }

    .progress-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }

    .progress-stat {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      font-family: var(--font-mono);
      font-size: 0.875rem;
    }

    .stat-value {
      font-weight: 700;
      font-size: 1.125rem;
    }

    .stat-value.painted {
      color: var(--success);
    }

    .stat-label {
      color: var(--text-secondary);
      font-size: 0.8125rem;
    }

    /* Actions Section */
    .actions-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-md) var(--space-lg);
      border-top: 1px solid var(--border-dim);
      background: var(--bg-panel);
    }

    :host ::ng-deep .actions-section {
      .p-button-outlined {
        border-color: var(--border-glow);
        color: var(--text-primary);

        &:hover {
          border-color: var(--gold);
          background: rgba(201, 162, 39, 0.1);
          color: var(--gold);
        }
      }

      .p-button-text {
        color: var(--text-secondary);

        &:hover {
          color: var(--gold);
          background: rgba(201, 162, 39, 0.1);
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArmyCardComponent {
  private readonly factionImageService = inject(FactionImageService);

  army = input.required<ArmyWithProgress>();

  cardClick = output<void>();
  viewClick = output<void>();
  editClick = output<void>();

  gameSystemLabel = computed(() => GAME_SYSTEM_LABELS[this.army().gameSystem] || this.army().gameSystem);

  heroBackground = computed(() => {
    const army = this.army();

    // Priority: 1. Custom background URL, 2. Default faction image, 3. None (use color)
    const imageUrl =
      army.backgroundImageUrl ||
      this.factionImageService.getDefaultImageForFaction(army.iconEmoji);

    if (imageUrl) {
      return `url('${imageUrl}')`;
    }

    return 'none';
  });

  onCardClick(): void {
    this.viewClick.emit();
  }

  onViewClick(event: Event): void {
    event.stopPropagation();
    this.viewClick.emit();
  }

  onEditClick(event: Event): void {
    event.stopPropagation();
    this.editClick.emit();
  }
}
