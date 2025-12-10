import { ChangeDetectionStrategy, Component, input, output, inject, signal, computed, OnInit, effect } from '@angular/core';
import { Miniature, MiniatureStatus, MiniatureTag, ModelStageCounts, UnbuiltState, WipStage, createDefaultStageCounts } from '@minipaint-pro/types';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { PointsBadgeComponent } from '../points-badge/points-badge.component';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { AdminService } from '../../../core/services/admin.service';

// Stage display configuration
interface StageDisplay {
  key: MiniatureStatus;
  label: string;
  shortLabel: string;
  color: string;
}

// Unbuilt state display configuration
interface UnbuiltStateDisplay {
  value: UnbuiltState;
  label: string;
  icon: string;
}

// WIP stage display configuration
interface WipStageDisplay {
  value: WipStage;
  label: string;
  icon: string;
}

// Tag display configuration
interface TagDisplay {
  value: MiniatureTag;
  label: string;
  icon: string;
}

const UNBUILT_STATE_DISPLAYS: UnbuiltStateDisplay[] = [
  { value: 'inbox', label: 'Inbox', icon: 'pi-inbox' },
  { value: 'on_sprue', label: 'On Sprue', icon: 'pi-th-large' },
  { value: 'clipped', label: 'Clipped', icon: 'pi-scissors' },
  { value: 'ready', label: 'Ready to Build', icon: 'pi-check-circle' },
];

const WIP_STAGE_DISPLAYS: WipStageDisplay[] = [
  { value: 'base_coated', label: 'Base Coated', icon: 'pi-circle-fill' },
  { value: 'blocking', label: 'Blocking', icon: 'pi-stop' },
  { value: 'layering', label: 'Layering', icon: 'pi-bars' },
  { value: 'washing', label: 'Washing', icon: 'pi-filter' },
  { value: 'highlighting', label: 'Highlighting', icon: 'pi-sun' },
  { value: 'detailing', label: 'Detailing', icon: 'pi-pencil' },
  { value: 'basing', label: 'Basing', icon: 'pi-box' },
];

const TAG_DISPLAYS: TagDisplay[] = [
  { value: 'magnetized', label: 'Magnetized', icon: 'pi-link' },
  { value: 'pinned', label: 'Pinned', icon: 'pi-map-marker' },
  { value: 'sub_assemblies', label: 'Sub-assemblies', icon: 'pi-sitemap' },
  { value: 'based', label: 'Based', icon: 'pi-box' },
  { value: 'contrast_method', label: 'Contrast', icon: 'pi-palette' },
  { value: 'varnished', label: 'Varnished', icon: 'pi-shield' },
  { value: 'decals_applied', label: 'Decals', icon: 'pi-image' },
  { value: 'display_quality', label: 'Display Quality', icon: 'pi-star' },
  { value: 'tabletop_ready', label: 'Tabletop Ready', icon: 'pi-play' },
];

const STAGE_DISPLAYS: StageDisplay[] = [
  { key: 'unbuilt', label: 'Unbuilt', shortLabel: 'U', color: 'var(--status-unbuilt)' },
  { key: 'assembled', label: 'Assembled', shortLabel: 'A', color: 'var(--status-assembled)' },
  { key: 'primed', label: 'Primed', shortLabel: 'P', color: 'var(--status-primed)' },
  { key: 'wip', label: 'WIP', shortLabel: 'W', color: 'var(--status-wip)' },
  { key: 'painted', label: 'Painted', shortLabel: 'D', color: 'var(--status-painted)' },
  { key: 'complete', label: 'Complete', shortLabel: '✓', color: 'var(--status-complete)' },
];

@Component({
  selector: 'app-mini-card',
  standalone: true,
  imports: [ButtonModule, TooltipModule, ProgressBarModule, PointsBadgeComponent, StatusBadgeComponent],
  template: `
    <div
      class="mini-card"
      [class.dragging]="isDragging()"
      tabindex="0"
      role="article"
    >
      <div class="image-container">
        @if (displayImageUrl()) {
          <img [src]="displayImageUrl()" [alt]="miniature().name" />
        } @else {
          <div class="image-placeholder">
            <i class="pi pi-image"></i>
          </div>
        }
        @if (displayTags().length > 0) {
          <div class="tag-badges">
            @for (tag of displayTags(); track tag.value) {
              <span class="tag-badge" [pTooltip]="tag.label" tooltipPosition="top">
                <i class="pi {{ tag.icon }}"></i>
              </span>
            }
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
          <span class="model-count" [class.hidden]="miniature().modelCount <= 1">
            {{ miniature().modelsCompleted }}/{{ miniature().modelCount }} models
          </span>
        </div>
        @if (showProgress()) {
          <div class="stage-progress">
            <div class="stage-bar">
              @for (segment of stageSegments(); track segment.key) {
                @if (segment.count > 0) {
                  <div
                    class="segment"
                    [style.width.%]="segment.percent"
                    [style.background]="segment.color"
                    [pTooltip]="segment.label + ': ' + segment.count"
                    tooltipPosition="top"
                  ></div>
                }
              }
            </div>
          </div>
        }
        @if (substateDisplay()) {
          <div class="substate-indicator" [class]="'substate-' + miniature().status">
            <i class="pi {{ substateDisplay()!.icon }}"></i>
            <span>{{ substateDisplay()!.label }}</span>
          </div>
        }
        <div class="footer">
          <app-status-badge [status]="miniature().status" />
          <div class="actions">
            @if (showProgress() && miniature().modelsCompleted < miniature().modelCount) {
              <p-button
                icon="pi pi-plus"
                [rounded]="true"
                [text]="true"
                severity="success"
                size="small"
                pTooltip="Mark one model complete"
                tooltipPosition="top"
                (onClick)="onIncrementClick($event)"
              />
            }
            <p-button
              icon="pi pi-eye"
              [rounded]="true"
              [text]="true"
              severity="secondary"
              size="small"
              pTooltip="View details"
              tooltipPosition="top"
              (onClick)="onViewClick($event)"
            />
            <p-button
              icon="pi pi-pencil"
              [rounded]="true"
              [text]="true"
              severity="secondary"
              size="small"
              pTooltip="Edit"
              tooltipPosition="top"
              (onClick)="onEditClick($event)"
            />
            <p-button
              icon="pi pi-trash"
              [rounded]="true"
              [text]="true"
              severity="danger"
              size="small"
              pTooltip="Delete"
              tooltipPosition="top"
              (onClick)="onDeleteClick($event)"
            />
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
      height: 100%;
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
      position: relative;
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
    }

    .image-placeholder i {
      font-size: 2rem;
    }

    .tag-badges {
      position: absolute;
      top: 4px;
      right: 4px;
      display: flex;
      flex-wrap: wrap;
      gap: 2px;
      max-width: 80%;
      justify-content: flex-end;
    }

    .tag-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      background: rgba(0, 0, 0, 0.7);
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      font-size: 0.625rem;
      backdrop-filter: blur(4px);

      &:hover {
        background: rgba(0, 0, 0, 0.85);
        color: var(--text-primary);
      }
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
      flex: 1;
      min-height: 2.4em;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .meta {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      font-family: var(--font-body);
      font-size: 0.75rem;
      color: var(--text-secondary);
      min-height: 18px;
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

      &.hidden {
        visibility: hidden;
      }
    }

    .stage-progress {
      margin-top: var(--space-xs);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .stage-bar {
      height: 6px;
      display: flex;
      border-radius: 3px;
      overflow: hidden;
      background: var(--bg-elevated);
    }

    .stage-bar .segment {
      height: 100%;
      transition: width 0.3s ease;
    }

    .substate-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 3px 6px;
      background: var(--bg-elevated);
      border-radius: var(--radius-sm);
      font-size: 0.625rem;
      color: var(--text-secondary);
      width: fit-content;

      i {
        font-size: 0.625rem;
      }

      span {
        text-transform: capitalize;
      }

      &.substate-unbuilt {
        border-left: 2px solid var(--status-unbuilt);
      }

      &.substate-wip {
        border-left: 2px solid var(--status-wip);
      }
    }

    .footer {
      margin-top: var(--space-xs);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .actions {
      display: flex;
      gap: var(--space-xs);
    }

    .actions :host ::ng-deep .p-button {
      width: 28px;
      height: 28px;
    }

    .actions :host ::ng-deep .p-button-icon {
      font-size: 0.875rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiniCardComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  miniature = input.required<Miniature>();
  isDragging = input<boolean>(false);

  cardClick = output<void>();
  viewClick = output<void>();
  editClick = output<void>();
  incrementClick = output<void>();
  deleteClick = output<void>();

  readonly showProgress = computed(() => this.miniature().modelCount > 1);
  readonly progressPercent = computed(() => {
    const mini = this.miniature();
    if (mini.modelCount <= 1) return 0;
    return Math.round((mini.modelsCompleted / mini.modelCount) * 100);
  });

  readonly stageCounts = computed((): ModelStageCounts => {
    const mini = this.miniature();
    return mini.stageCounts ?? createDefaultStageCounts(mini.modelCount, mini.status);
  });

  readonly stageSegments = computed(() => {
    const counts = this.stageCounts();
    const total = this.miniature().modelCount;

    return STAGE_DISPLAYS.map((stage) => ({
      key: stage.key,
      label: stage.label,
      shortLabel: stage.shortLabel,
      color: stage.color,
      count: counts[stage.key],
      percent: total > 0 ? (counts[stage.key] / total) * 100 : 0,
    }));
  });

  readonly wipStageLabel = computed(() => {
    const mini = this.miniature();
    if (!mini.wipStage) return null;
    return mini.wipStage.replace(/_/g, ' ');
  });

  readonly tags = computed(() => {
    return this.miniature().tags ?? [];
  });

  readonly displayTags = computed(() => {
    const tagValues = this.tags();
    return TAG_DISPLAYS.filter((t) => tagValues.includes(t.value));
  });

  readonly substateDisplay = computed((): { label: string; icon: string } | null => {
    const mini = this.miniature();

    // Show unbuiltState if status is 'unbuilt' and unbuiltState is set
    if (mini.status === 'unbuilt' && mini.unbuiltState) {
      const display = UNBUILT_STATE_DISPLAYS.find((d) => d.value === mini.unbuiltState);
      return display ? { label: display.label, icon: display.icon } : null;
    }

    // Show wipStage if status is 'wip' and wipStage is set
    if (mini.status === 'wip' && mini.wipStage) {
      const display = WIP_STAGE_DISPLAYS.find((d) => d.value === mini.wipStage);
      return display ? { label: display.label, icon: display.icon } : null;
    }

    return null;
  });

  private readonly localImageUrl = signal<string | null>(null);

  readonly displayImageUrl = computed(() => {
    // First priority: user-provided imageUrl
    const mini = this.miniature();
    if (mini.imageUrl) {
      return mini.imageUrl;
    }
    // Second priority: locally stored unit image
    return this.localImageUrl();
  });

  constructor() {
    // Fetch local image when miniature changes
    effect(() => {
      const mini = this.miniature();
      if (!mini.imageUrl && mini.gameSystem && mini.faction && mini.name) {
        this.fetchLocalImage(mini);
      }
    });
  }

  ngOnInit(): void {
    // Initial fetch handled by effect
  }

  private fetchLocalImage(mini: Miniature): void {
    const gameSystemMap: Record<string, string> = {
      warhammer40k: 'WARHAMMER_40K',
      ageOfSigmar: 'AGE_OF_SIGMAR',
      killTeam: 'KILL_TEAM',
      necromunda: 'NECROMUNDA',
      horusHeresy: 'HORUS_HERESY',
      other: 'OTHER',
    };

    const gameSystem = mini.gameSystem ? gameSystemMap[mini.gameSystem] || mini.gameSystem : 'WARHAMMER_40K';

    this.adminService
      .getUnitImageUrl(gameSystem, mini.faction, mini.name)
      .then((url) => {
        if (url) {
          this.localImageUrl.set(url);
        }
      })
      .catch(() => {
        // Silently fail - no image available
      });
  }

  onViewClick(event: Event): void {
    event.stopPropagation();
    this.viewClick.emit();
  }

  onEditClick(event: Event): void {
    event.stopPropagation();
    this.editClick.emit();
  }

  onIncrementClick(event: Event): void {
    event.stopPropagation();
    this.incrementClick.emit();
  }

  onDeleteClick(event: Event): void {
    event.stopPropagation();
    this.deleteClick.emit();
  }
}
