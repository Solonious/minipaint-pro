import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import {
  CdkDropList,
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
} from '@angular/cdk/drag-drop';
import { Miniature, MiniatureStatus } from '@minipaint-pro/types';
import { MiniCardComponent } from '../mini-card/mini-card.component';

export interface StatusConfig {
  status: MiniatureStatus;
  label: string;
  color: string;
}

export const STATUS_CONFIGS: StatusConfig[] = [
  { status: 'unbuilt', label: 'Unbuilt', color: 'var(--status-unbuilt)' },
  { status: 'assembled', label: 'Assembled', color: 'var(--status-assembled)' },
  { status: 'primed', label: 'Primed', color: 'var(--status-primed)' },
  { status: 'wip', label: 'WIP', color: 'var(--status-wip)' },
  { status: 'painted', label: 'Painted', color: 'var(--status-painted)' },
  { status: 'complete', label: 'Complete', color: 'var(--status-complete)' },
];

@Component({
  selector: 'app-kanban-column',
  standalone: true,
  imports: [CdkDropList, CdkDrag, CdkDragPlaceholder, MiniCardComponent],
  template: `
    <div class="kanban-column">
      <div class="column-header">
        <span class="status-indicator" [style.background-color]="config().color"></span>
        <h3 class="column-title">{{ config().label }}</h3>
        <span class="count">{{ miniatures().length }}</span>
      </div>
      <div
        class="column-content"
        cdkDropList
        [id]="config().status"
        [cdkDropListData]="config().status"
        [cdkDropListConnectedTo]="connectedLists()"
        (cdkDropListDropped)="onDrop($event)"
      >
        @for (mini of miniatures(); track mini.id) {
          <div cdkDrag [cdkDragData]="mini">
            <app-mini-card
              [miniature]="mini"
              (cardClick)="cardClick.emit(mini)"
              (viewClick)="viewClick.emit(mini)"
              (editClick)="editClick.emit(mini)"
            />
            <div class="drag-placeholder" *cdkDragPlaceholder></div>
          </div>
        }
        @if (miniatures().length === 0) {
          <div class="empty-state">
            <span class="empty-text">Drop miniatures here</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex: 1;
      min-width: 0;
    }

    .kanban-column {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 180px;
      background: var(--bg-panel);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .column-header {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-md);
      background: var(--bg-card);
      border-bottom: 1px solid var(--border-dim);
    }

    .status-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .column-title {
      flex: 1;
      margin: 0;
      font-family: var(--font-heading);
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .count {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      height: 24px;
      padding: 0 var(--space-xs);
      background: var(--bg-elevated);
      border-radius: var(--radius-sm);
      font-family: var(--font-mono);
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .column-content {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      padding: var(--space-sm);
      min-height: 200px;
      max-height: calc(100vh - 280px);
      overflow-y: auto;
    }

    .column-content::-webkit-scrollbar {
      width: 6px;
    }

    .column-content::-webkit-scrollbar-track {
      background: transparent;
    }

    .column-content::-webkit-scrollbar-thumb {
      background: var(--border-dim);
      border-radius: 3px;
    }

    .column-content::-webkit-scrollbar-thumb:hover {
      background: var(--border-glow);
    }

    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100px;
      border: 2px dashed var(--border-dim);
      border-radius: var(--radius-md);
      color: var(--text-dim);
    }

    .empty-text {
      font-family: var(--font-body);
      font-size: 0.875rem;
    }

    .drag-placeholder {
      background: var(--bg-elevated);
      border: 2px dashed var(--gold);
      border-radius: var(--radius-md);
      min-height: 80px;
      opacity: 0.5;
    }

    :host ::ng-deep .cdk-drag-preview {
      box-shadow: var(--shadow-lg);
      border-radius: var(--radius-md);
    }

    :host ::ng-deep .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .cdk-drop-list-dragging .cdk-drag:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanColumnComponent {
  config = input.required<StatusConfig>();
  miniatures = input.required<Miniature[]>();
  connectedLists = input<string[]>([]);

  cardClick = output<Miniature>();
  viewClick = output<Miniature>();
  editClick = output<Miniature>();
  itemDropped = output<CdkDragDrop<MiniatureStatus, MiniatureStatus, Miniature>>();

  onDrop(event: CdkDragDrop<MiniatureStatus, MiniatureStatus, Miniature>): void {
    this.itemDropped.emit(event);
  }
}
