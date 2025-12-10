# Component Patterns for Liber Pigmenta

Reusable Angular component patterns for the miniature painting companion app.

## Miniature Card Component

Displays a miniature unit with image, status, and actions.

```typescript
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Miniature, MiniatureStatus } from '@minipaint-pro/types';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { PointsBadgeComponent } from '../points-badge/points-badge.component';

@Component({
  selector: 'app-mini-card',
  standalone: true,
  imports: [ButtonModule, TooltipModule, StatusBadgeComponent, PointsBadgeComponent],
  template: `
    <div class="mini-card" tabindex="0" role="article">
      <div class="image-container">
        @if (miniature().imageUrl) {
          <img [src]="miniature().imageUrl" [alt]="miniature().name" />
        } @else {
          <div class="image-placeholder">
            <i class="pi pi-image"></i>
          </div>
        }
      </div>
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
          <div class="actions">
            <p-button icon="pi pi-pencil" [rounded]="true" [text]="true"
              severity="secondary" size="small" pTooltip="Edit"
              (onClick)="onEditClick($event)" />
            <p-button icon="pi pi-trash" [rounded]="true" [text]="true"
              severity="danger" size="small" pTooltip="Delete"
              (onClick)="onDeleteClick($event)" />
          </div>
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

    .image-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-dim);
      font-size: 2rem;
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
      font-family: var(--font-display);
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      line-height: 1.2;
    }

    .meta {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: var(--space-xs);
    }

    .actions {
      display: flex;
      gap: var(--space-xs);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiniCardComponent {
  miniature = input.required<Miniature>();

  editClick = output<void>();
  deleteClick = output<void>();

  onEditClick(event: Event): void {
    event.stopPropagation();
    this.editClick.emit();
  }

  onDeleteClick(event: Event): void {
    event.stopPropagation();
    this.deleteClick.emit();
  }
}
```

## Status Badge Component

Displays miniature painting status with colored indicator.

```typescript
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
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  status = input.required<MiniatureStatus>();
  config = computed(() => STATUS_CONFIG[this.status()]);
}
```

## Points Badge Component

Displays points value with imperial styling.

```typescript
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-points-badge',
  standalone: true,
  template: `
    <span class="points-badge">
      <span class="value">{{ points() }}</span>
      <span class="label">pts</span>
    </span>
  `,
  styles: `
    .points-badge {
      display: inline-flex;
      align-items: baseline;
      gap: 2px;
      padding: 2px var(--space-sm);
      background: var(--bg-elevated);
      border-radius: var(--radius-sm);
    }

    .value {
      font-family: var(--font-mono);
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--gold);
    }

    .label {
      font-family: var(--font-body);
      font-size: 0.625rem;
      color: var(--text-dim);
      text-transform: uppercase;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PointsBadgeComponent {
  points = input.required<number>();
}
```

## Paint Swatch Component

Displays a paint color with brand and type info.

```typescript
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Paint } from '@minipaint-pro/types';

const BRAND_LABELS: Record<string, string> = {
  citadel: 'Citadel',
  vallejo: 'Vallejo',
  armyPainter: 'Army Painter',
  scale75: 'Scale75',
  other: 'Other',
};

@Component({
  selector: 'app-paint-card',
  standalone: true,
  template: `
    <div class="paint-card" [class.owned]="paint().owned">
      <div class="swatch" [style.background-color]="paint().colorHex">
        @if (paint().owned) {
          <span class="owned-check">&#10003;</span>
        }
      </div>
      <div class="info">
        <span class="name">{{ paint().name }}</span>
        <div class="meta">
          <span class="brand">{{ brandLabel() }}</span>
          <span class="type">{{ paint().type }}</span>
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
      transition: all var(--transition-fast);
      cursor: pointer;
    }

    .paint-card:hover {
      border-color: var(--border-glow);
      transform: translateY(-2px);
    }

    .paint-card.owned {
      border-color: var(--success);
    }

    .swatch {
      position: relative;
      height: 60px;
      width: 100%;
    }

    .owned-check {
      position: absolute;
      top: var(--space-xs);
      right: var(--space-xs);
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--success);
      color: var(--bg-void);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: bold;
    }

    .info {
      padding: var(--space-sm);
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }

    .name {
      font-family: var(--font-body);
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.6875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .brand { color: var(--text-secondary); }
    .type { color: var(--text-dim); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaintCardComponent {
  paint = input.required<Paint>();
  toggleOwned = output<string>();

  brandLabel = computed(() => BRAND_LABELS[this.paint().brand] || this.paint().brand);
}
```

## Progress Ring Component

SVG-based circular progress indicator.

```typescript
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-progress-ring',
  standalone: true,
  template: `
    <div class="progress-ring" [style.width.px]="size()" [style.height.px]="size()">
      <svg [attr.viewBox]="'0 0 ' + size() + ' ' + size()">
        <circle class="track"
          [attr.cx]="center()" [attr.cy]="center()" [attr.r]="radius()"
          [attr.stroke-width]="strokeWidth()" fill="none" />
        <circle class="progress"
          [attr.cx]="center()" [attr.cy]="center()" [attr.r]="radius()"
          [attr.stroke-width]="strokeWidth()"
          [attr.stroke-dasharray]="circumference()"
          [attr.stroke-dashoffset]="dashOffset()"
          [style.stroke]="color()" fill="none" />
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
      font-family: var(--font-mono);
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
```

## Army Card Component

Displays army with progress and statistics.

```typescript
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Army } from '@minipaint-pro/types';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressRingComponent } from '../progress-ring/progress-ring.component';
import { PointsBadgeComponent } from '../points-badge/points-badge.component';

@Component({
  selector: 'app-army-card',
  standalone: true,
  imports: [ButtonModule, TooltipModule, ProgressRingComponent, PointsBadgeComponent],
  template: `
    <div class="army-card" tabindex="0" role="article">
      <div class="icon-section" [style.background-color]="army().colorHex || 'var(--bg-elevated)'">
        @if (army().iconEmoji) {
          <span class="icon">{{ army().iconEmoji }}</span>
        } @else {
          <span class="placeholder">{{ initials() }}</span>
        }
      </div>
      <div class="content">
        <div class="header">
          <h3 class="name">{{ army().name }}</h3>
          <app-progress-ring [value]="progressPercent()" [size]="48" [strokeWidth]="4" />
        </div>
        <div class="meta">
          <span class="faction">{{ army().faction }}</span>
          <span class="system">{{ army().gameSystem }}</span>
        </div>
        <div class="stats">
          <div class="stat">
            <span class="stat-value">{{ completedCount() }}</span>
            <span class="stat-label">/ {{ army().miniatureCount }} painted</span>
          </div>
          <div class="points">
            <app-points-badge [points]="currentPoints()" />
            <span class="target">/ {{ army().targetPoints }} pts</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .army-card {
      display: flex;
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
    }

    .icon {
      font-size: 2rem;
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
    }

    .name {
      font-family: var(--font-display);
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .meta {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .faction { color: var(--gold); }
    .system { color: var(--text-secondary); }

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

    .stat-label { color: var(--text-secondary); }

    .points {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
    }

    .target {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--text-secondary);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArmyCardComponent {
  army = input.required<Army>();

  initials = computed(() => {
    const words = this.army().name.split(' ');
    return words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
  });

  completedCount = computed(() => this.army().completedCount ?? 0);
  currentPoints = computed(() => this.army().currentPoints ?? 0);
  progressPercent = computed(() => {
    const total = this.army().miniatureCount ?? 0;
    if (total === 0) return 0;
    return Math.round((this.completedCount() / total) * 100);
  });
}
```

## Achievement Badge Component

Displays gamification achievements.

```typescript
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
```

## Stage Progress Bar Component

Segmented progress bar showing models at each painting stage.

```typescript
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MiniatureStatus, ModelStageCounts } from '@minipaint-pro/types';
import { TooltipModule } from 'primeng/tooltip';

const STAGE_DISPLAYS = [
  { key: 'unbuilt', label: 'Unbuilt', color: 'var(--status-unbuilt)' },
  { key: 'assembled', label: 'Assembled', color: 'var(--status-assembled)' },
  { key: 'primed', label: 'Primed', color: 'var(--status-primed)' },
  { key: 'wip', label: 'WIP', color: 'var(--status-wip)' },
  { key: 'painted', label: 'Painted', color: 'var(--status-painted)' },
  { key: 'complete', label: 'Complete', color: 'var(--status-complete)' },
] as const;

@Component({
  selector: 'app-stage-progress',
  standalone: true,
  imports: [TooltipModule],
  template: `
    <div class="stage-bar">
      @for (segment of segments(); track segment.key) {
        @if (segment.count > 0) {
          <div class="segment"
            [style.width.%]="segment.percent"
            [style.background]="segment.color"
            [pTooltip]="segment.label + ': ' + segment.count"
            tooltipPosition="top">
          </div>
        }
      }
    </div>
  `,
  styles: `
    .stage-bar {
      height: 6px;
      display: flex;
      border-radius: 3px;
      overflow: hidden;
      background: var(--bg-elevated);
    }

    .segment {
      height: 100%;
      transition: width 0.3s ease;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StageProgressComponent {
  stageCounts = input.required<ModelStageCounts>();
  totalModels = input.required<number>();

  segments = computed(() => {
    const counts = this.stageCounts();
    const total = this.totalModels();

    return STAGE_DISPLAYS.map(stage => ({
      key: stage.key,
      label: stage.label,
      color: stage.color,
      count: counts[stage.key as MiniatureStatus] ?? 0,
      percent: total > 0 ? ((counts[stage.key as MiniatureStatus] ?? 0) / total) * 100 : 0,
    }));
  });
}
```

## Common Layout Patterns

### Card Grid

```html
<div class="card-grid">
  @for (item of items(); track item.id) {
    <app-mini-card [miniature]="item" />
  }
</div>
```

```scss
.card-grid {
  display: grid;
  gap: var(--space-md);
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}
```

### Page Header

```html
<div class="page-header">
  <div class="title-section">
    <h1 class="page-title">Page Title</h1>
    <p class="page-subtitle">Description text</p>
  </div>
  <div class="actions">
    <p-button label="Add New" icon="pi pi-plus" />
  </div>
</div>
```

```scss
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-lg);
}

.page-title {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  color: var(--text-primary);
  margin: 0;
}

.page-subtitle {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-top: var(--space-xs);
}
```

### Empty State

```html
<div class="empty-state">
  <i class="pi pi-inbox"></i>
  <h3>No Items Yet</h3>
  <p>Start by adding your first item</p>
  <p-button label="Add First" icon="pi pi-plus" />
</div>
```

```scss
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  text-align: center;
  color: var(--text-secondary);

  i {
    font-size: 3rem;
    color: var(--text-dim);
    margin-bottom: var(--space-md);
  }

  h3 {
    font-family: var(--font-heading);
    margin: 0 0 var(--space-sm);
  }

  p {
    margin: 0 0 var(--space-md);
  }
}
```
