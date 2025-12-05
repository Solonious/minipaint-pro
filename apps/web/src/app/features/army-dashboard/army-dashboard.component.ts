import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import {
  Army,
  ArmyWithProgress,
  CreateArmyDto,
  UpdateArmyDto,
} from '@minipaint-pro/types';
import { ArmyService } from '../../core/services/army.service';
import { ArmyCardComponent } from '../../shared/components/army-card/army-card.component';
import { ArmyDialogComponent } from '../../shared/components/army-dialog/army-dialog.component';

@Component({
  selector: 'app-army-dashboard',
  standalone: true,
  imports: [
    ButtonModule,
    TooltipModule,
    ArmyCardComponent,
    ArmyDialogComponent,
  ],
  templateUrl: './army-dashboard.component.html',
  styleUrl: './army-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArmyDashboardComponent {
  private readonly armyService = inject(ArmyService);

  readonly armiesWithProgress = this.armyService.armiesWithProgress;

  readonly totalArmies = computed(() => this.armiesWithProgress().length);

  readonly totalMiniatures = computed(() =>
    this.armiesWithProgress().reduce((sum, army) => sum + army.miniatureCount, 0)
  );

  readonly totalCompletedMiniatures = computed(() =>
    this.armiesWithProgress().reduce((sum, army) => sum + army.completedCount, 0)
  );

  readonly totalPoints = computed(() =>
    this.armiesWithProgress().reduce((sum, army) => sum + army.currentPoints, 0)
  );

  readonly totalTargetPoints = computed(() =>
    this.armiesWithProgress().reduce((sum, army) => sum + army.targetPoints, 0)
  );

  readonly overallProgress = computed(() => {
    const target = this.totalTargetPoints();
    if (target === 0) return 0;
    return Math.round((this.totalPoints() / target) * 100);
  });

  dialogVisible = signal(false);
  selectedArmy = signal<Army | null>(null);

  openAddDialog(): void {
    this.selectedArmy.set(null);
    this.dialogVisible.set(true);
  }

  openEditDialog(army: ArmyWithProgress): void {
    const baseArmy: Army = {
      id: army.id,
      userId: army.userId,
      name: army.name,
      faction: army.faction,
      gameSystem: army.gameSystem,
      targetPoints: army.targetPoints,
      iconEmoji: army.iconEmoji,
      colorHex: army.colorHex,
      createdAt: army.createdAt,
      updatedAt: army.updatedAt,
    };
    this.selectedArmy.set(baseArmy);
    this.dialogVisible.set(true);
  }

  onDialogVisibleChange(visible: boolean): void {
    this.dialogVisible.set(visible);
    if (!visible) {
      this.selectedArmy.set(null);
    }
  }

  onSave(dto: CreateArmyDto | UpdateArmyDto): void {
    const selected = this.selectedArmy();
    if (selected) {
      this.armyService.update(selected.id, dto as UpdateArmyDto);
    } else {
      this.armyService.add(dto as CreateArmyDto);
    }
  }

  onDelete(id: string): void {
    this.armyService.delete(id);
  }
}
