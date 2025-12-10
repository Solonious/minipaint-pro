import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import {
  Army,
  ArmyWithProgress,
  CreateArmyDto,
  CreateMiniatureDto,
  CreateUnitTemplateDto,
  Miniature,
  UpdateArmyDto,
  UpdateMiniatureDto,
} from '@minipaint-pro/types';
import { ArmyService } from '../../../core/services/army.service';
import { MiniatureService } from '../../../core/services/miniature.service';
import { UnitTemplateService } from '../../../core/services/unit-template.service';
import { PageLoaderComponent } from '../../../shared/components/loading-skeleton/page-loader.component';
import { ProgressRingComponent } from '../../../shared/components/progress-ring/progress-ring.component';
import { PointsBadgeComponent } from '../../../shared/components/points-badge/points-badge.component';
import { MiniCardComponent } from '../../../shared/components/mini-card/mini-card.component';
import { ArmyDialogComponent } from '../../../shared/components/army-dialog/army-dialog.component';
import { MiniatureDialogComponent } from '../../../shared/components/miniature-dialog/miniature-dialog.component';

const GAME_SYSTEM_LABELS: Record<string, string> = {
  warhammer40k: 'Warhammer 40K',
  ageOfSigmar: 'Age of Sigmar',
  killTeam: 'Kill Team',
  necromunda: 'Necromunda',
  horusHeresy: 'Horus Heresy',
  other: 'Other',
};

@Component({
  selector: 'app-army-detail',
  standalone: true,
  imports: [
    ButtonModule,
    TooltipModule,
    TagModule,
    PageLoaderComponent,
    ProgressRingComponent,
    PointsBadgeComponent,
    MiniCardComponent,
    ArmyDialogComponent,
    MiniatureDialogComponent,
  ],
  templateUrl: './army-detail.component.html',
  styleUrl: './army-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArmyDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly armyService = inject(ArmyService);
  private readonly miniatureService = inject(MiniatureService);
  private readonly unitTemplateService = inject(UnitTemplateService);

  readonly loading = signal(true);
  readonly army = signal<ArmyWithProgress | null>(null);

  readonly armyMiniatures = computed(() => {
    const currentArmy = this.army();
    if (!currentArmy) return [];
    return this.miniatureService.getByArmyId(currentArmy.id);
  });

  readonly gameSystemLabel = computed(() => {
    const currentArmy = this.army();
    if (!currentArmy) return '';
    return GAME_SYSTEM_LABELS[currentArmy.gameSystem] || currentArmy.gameSystem;
  });

  // Army edit dialog
  armyDialogVisible = signal(false);

  // Miniature dialogs
  miniatureDialogVisible = signal(false);
  selectedMiniature = signal<Miniature | null>(null);

  ngOnInit(): void {
    // Ensure data is loaded before accessing
    this.armyService.loadAll();
    this.miniatureService.loadAll();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadArmy(id);
    } else {
      this.loading.set(false);
    }
  }

  private loadArmy(id: string): void {
    this.loading.set(true);
    const armiesWithProgress = this.armyService.armiesWithProgress();
    const found = armiesWithProgress.find((a) => a.id === id);

    if (found) {
      this.army.set(found);
    }

    this.loading.set(false);
  }

  goBack(): void {
    this.router.navigate(['/armies']);
  }

  // Army edit methods
  openEditArmyDialog(): void {
    this.armyDialogVisible.set(true);
  }

  onArmyDialogVisibleChange(visible: boolean): void {
    this.armyDialogVisible.set(visible);
  }

  onArmySave(dto: CreateArmyDto | UpdateArmyDto): void {
    const currentArmy = this.army();
    if (currentArmy) {
      this.armyService.update(currentArmy.id, dto as UpdateArmyDto);
      // Reload the army data after update
      setTimeout(() => {
        this.loadArmy(currentArmy.id);
      }, 100);
    }
  }

  onArmyDelete(id: string): void {
    this.armyService.delete(id);
    this.router.navigate(['/armies']);
  }

  // Miniature methods
  openAddMiniatureDialog(): void {
    this.selectedMiniature.set(null);
    this.miniatureDialogVisible.set(true);
  }

  openEditMiniatureDialog(miniature: Miniature): void {
    this.selectedMiniature.set(miniature);
    this.miniatureDialogVisible.set(true);
  }

  onMiniatureDialogVisibleChange(visible: boolean): void {
    this.miniatureDialogVisible.set(visible);
    if (!visible) {
      this.selectedMiniature.set(null);
    }
  }

  onMiniatureSave(dto: CreateMiniatureDto | UpdateMiniatureDto): void {
    const selected = this.selectedMiniature();
    const currentArmy = this.army();

    if (selected) {
      this.miniatureService.update(selected.id, dto as UpdateMiniatureDto);
    } else if (currentArmy) {
      // Add new miniature with army pre-filled
      const createDto: CreateMiniatureDto = {
        ...dto as CreateMiniatureDto,
        armyId: currentArmy.id,
        faction: currentArmy.faction,
        gameSystem: currentArmy.gameSystem,
      };
      this.miniatureService.add(createDto);
    }

    // Reload army data to get updated counts
    if (currentArmy) {
      setTimeout(() => {
        this.loadArmy(currentArmy.id);
      }, 100);
    }
  }

  onMiniatureDelete(id: string): void {
    this.miniatureService.delete(id);
    const currentArmy = this.army();
    if (currentArmy) {
      setTimeout(() => {
        this.loadArmy(currentArmy.id);
      }, 100);
    }
  }

  onTemplateCreated(dto: CreateUnitTemplateDto): void {
    this.unitTemplateService.findOrCreate(dto).subscribe();
  }

  navigateToMiniatureDetail(miniature: Miniature): void {
    this.router.navigate(['/pile', miniature.id]);
  }

  onIncrementCompleted(miniature: Miniature): void {
    this.miniatureService.incrementCompleted(miniature.id);
  }

  getBaseArmy(): Army | null {
    const currentArmy = this.army();
    if (!currentArmy) return null;

    return {
      id: currentArmy.id,
      userId: currentArmy.userId,
      name: currentArmy.name,
      faction: currentArmy.faction,
      gameSystem: currentArmy.gameSystem,
      targetPoints: currentArmy.targetPoints,
      iconEmoji: currentArmy.iconEmoji,
      colorHex: currentArmy.colorHex,
      createdAt: currentArmy.createdAt,
      updatedAt: currentArmy.updatedAt,
    };
  }
}
