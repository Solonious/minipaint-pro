import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ChipModule } from 'primeng/chip';
import {
  Army,
  CreateMiniatureDto,
  CreateUnitTemplateDto,
  GameSystem,
  Miniature,
  MiniatureFilters,
  MiniatureStatus,
  UpdateMiniatureDto,
} from '@minipaint-pro/types';
import { ArmyService } from '../../core/services/army.service';
import { MiniatureService } from '../../core/services/miniature.service';
import { UnitTemplateService } from '../../core/services/unit-template.service';
import {
  KanbanColumnComponent,
  STATUS_CONFIGS,
} from '../../shared/components/kanban-column/kanban-column.component';
import { MiniatureDialogComponent } from '../../shared/components/miniature-dialog/miniature-dialog.component';
import { PageLoaderComponent } from '../../shared/components/loading-skeleton';

interface GameSystemOption {
  label: string;
  value: GameSystem;
}

interface FactionOption {
  label: string;
  value: string;
}

interface ArmyOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-pile-of-shame',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    ChipModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SelectModule,
    TooltipModule,
    KanbanColumnComponent,
    MiniatureDialogComponent,
    PageLoaderComponent,
  ],
  templateUrl: './pile-of-shame.component.html',
  styleUrl: './pile-of-shame.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PileOfShameComponent implements OnInit {
  private readonly armyService = inject(ArmyService);
  private readonly miniatureService = inject(MiniatureService);
  private readonly unitTemplateService = inject(UnitTemplateService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.miniatureService.loadAll();
    this.armyService.loadAll();
  }

  readonly statusConfigs = STATUS_CONFIGS;
  readonly connectedListIds = STATUS_CONFIGS.map((c) => c.status);

  readonly loading = this.miniatureService.loading;
  readonly totalCount = this.miniatureService.totalCount;
  readonly totalPoints = this.miniatureService.totalPoints;
  readonly completedCount = this.miniatureService.completedCount;

  // Filter signals
  readonly searchQuery = signal('');
  readonly selectedGameSystem = signal<GameSystem | null>(null);
  readonly selectedFaction = signal<string | null>(null);
  readonly selectedArmy = signal<string | null>(null);

  // Game system options
  readonly gameSystemOptions: GameSystemOption[] = [
    { label: 'Warhammer 40K', value: 'WARHAMMER_40K' },
    { label: 'Age of Sigmar', value: 'AGE_OF_SIGMAR' },
    { label: 'Kill Team', value: 'KILL_TEAM' },
    { label: 'Necromunda', value: 'NECROMUNDA' },
    { label: 'Horus Heresy', value: 'HORUS_HERESY' },
    { label: 'Other', value: 'OTHER' },
  ];

  // Dynamic faction options from miniatures data
  readonly factionOptions = computed<FactionOption[]>(() => {
    const factions = this.miniatureService.getUniqueFactions();
    return factions.map((f) => ({ label: f, value: f }));
  });

  // Dynamic army options from armies data
  readonly armyOptions = computed<ArmyOption[]>(() => {
    const armies = this.armyService.armies();
    return armies.map((a) => ({ label: a.name, value: a.id }));
  });

  // Computed filters object
  readonly currentFilters = computed<MiniatureFilters>(() => ({
    search: this.searchQuery(),
    gameSystem: this.selectedGameSystem(),
    faction: this.selectedFaction(),
    armyId: this.selectedArmy(),
  }));

  // Computed filtered miniatures
  readonly filteredMiniatures = computed(() => {
    return this.miniatureService.getFilteredMiniatures(this.currentFilters());
  });

  // Filtered miniatures grouped by status
  readonly filteredMiniaturesByStatus = computed(() => {
    const minis = this.filteredMiniatures();
    const grouped: Record<MiniatureStatus, Miniature[]> = {
      unbuilt: [],
      assembled: [],
      primed: [],
      wip: [],
      painted: [],
      complete: [],
    };

    for (const mini of minis) {
      grouped[mini.status].push(mini);
    }

    return grouped;
  });

  // Filtered stats
  readonly filteredCount = computed(() => this.filteredMiniatures().length);
  readonly filteredCompletedCount = computed(
    () => this.filteredMiniatures().filter((m) => m.status === 'complete').length
  );
  readonly filteredTotalPoints = computed(() =>
    this.filteredMiniatures().reduce((sum, m) => sum + m.points, 0)
  );

  readonly progressPercentage = computed(() => {
    const total = this.filteredCount();
    if (total === 0) return 0;
    return Math.round((this.filteredCompletedCount() / total) * 100);
  });

  // Check if any filters are active
  readonly hasActiveFilters = computed(() => {
    return (
      this.searchQuery() !== '' ||
      this.selectedGameSystem() !== null ||
      this.selectedFaction() !== null ||
      this.selectedArmy() !== null
    );
  });

  // Active filter count for badge
  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.searchQuery()) count++;
    if (this.selectedGameSystem()) count++;
    if (this.selectedFaction()) count++;
    if (this.selectedArmy()) count++;
    return count;
  });

  dialogVisible = signal(false);
  selectedMiniature = signal<Miniature | null>(null);

  // Filter methods
  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  onGameSystemChange(value: GameSystem | null): void {
    this.selectedGameSystem.set(value);
  }

  onFactionChange(value: string | null): void {
    this.selectedFaction.set(value);
  }

  onArmyChange(value: string | null): void {
    this.selectedArmy.set(value);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedGameSystem.set(null);
    this.selectedFaction.set(null);
    this.selectedArmy.set(null);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  clearGameSystem(): void {
    this.selectedGameSystem.set(null);
  }

  clearFaction(): void {
    this.selectedFaction.set(null);
  }

  clearArmy(): void {
    this.selectedArmy.set(null);
  }

  getGameSystemLabel(value: GameSystem): string {
    const option = this.gameSystemOptions.find((o) => o.value === value);
    return option?.label ?? value;
  }

  getArmyLabel(armyId: string): string {
    const army = this.armyService.getById(armyId);
    return army?.name ?? armyId;
  }

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
    return this.filteredMiniaturesByStatus()[status];
  }
}
