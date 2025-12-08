import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import {
  CreateMiniatureDto,
  CreateUnitTemplateDto,
  Miniature,
  MiniatureStatus,
  UpdateMiniatureDto,
} from '@minipaint-pro/types';
import { MiniatureService } from '../../core/services/miniature.service';
import { UnitTemplateService } from '../../core/services/unit-template.service';
import {
  KanbanColumnComponent,
  STATUS_CONFIGS,
} from '../../shared/components/kanban-column/kanban-column.component';
import { MiniatureDialogComponent } from '../../shared/components/miniature-dialog/miniature-dialog.component';
import { PageLoaderComponent } from '../../shared/components/loading-skeleton';

@Component({
  selector: 'app-pile-of-shame',
  standalone: true,
  imports: [
    ButtonModule,
    TooltipModule,
    KanbanColumnComponent,
    MiniatureDialogComponent,
    PageLoaderComponent,
  ],
  templateUrl: './pile-of-shame.component.html',
  styleUrl: './pile-of-shame.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PileOfShameComponent {
  private readonly miniatureService = inject(MiniatureService);
  private readonly unitTemplateService = inject(UnitTemplateService);
  private readonly router = inject(Router);

  readonly statusConfigs = STATUS_CONFIGS;
  readonly connectedListIds = STATUS_CONFIGS.map((c) => c.status);

  readonly loading = this.miniatureService.loading;
  readonly miniaturesByStatus = this.miniatureService.miniaturesByStatus;
  readonly totalCount = this.miniatureService.totalCount;
  readonly totalPoints = this.miniatureService.totalPoints;
  readonly completedCount = this.miniatureService.completedCount;

  readonly progressPercentage = computed(() => {
    const total = this.totalCount();
    if (total === 0) return 0;
    return Math.round((this.completedCount() / total) * 100);
  });

  dialogVisible = signal(false);
  selectedMiniature = signal<Miniature | null>(null);

  openAddDialog(): void {
    this.selectedMiniature.set(null);
    this.dialogVisible.set(true);
  }

  openEditDialog(miniature: Miniature): void {
    this.selectedMiniature.set(miniature);
    this.dialogVisible.set(true);
  }

  navigateToDetail(miniature: Miniature): void {
    this.router.navigate(['/pile', miniature.id]);
  }

  onDialogVisibleChange(visible: boolean): void {
    this.dialogVisible.set(visible);
    if (!visible) {
      this.selectedMiniature.set(null);
    }
  }

  onSave(dto: CreateMiniatureDto | UpdateMiniatureDto): void {
    const selected = this.selectedMiniature();
    if (selected) {
      this.miniatureService.update(selected.id, dto as UpdateMiniatureDto);
    } else {
      this.miniatureService.add(dto as CreateMiniatureDto);
    }
  }

  onDelete(id: string): void {
    this.miniatureService.delete(id);
  }

  onTemplateCreated(dto: CreateUnitTemplateDto): void {
    this.unitTemplateService.findOrCreate(dto).subscribe();
  }

  onIncrementCompleted(miniature: Miniature): void {
    this.miniatureService.incrementCompleted(miniature.id);
  }

  onDrop(event: CdkDragDrop<MiniatureStatus, MiniatureStatus, Miniature>): void {
    const miniature = event.item.data;
    const newStatus = event.container.data;

    if (miniature.status !== newStatus) {
      this.miniatureService.updateStatus(miniature.id, newStatus);
    }
  }

  getMiniaturesByStatus(status: MiniatureStatus): Miniature[] {
    return this.miniaturesByStatus()[status];
  }
}
