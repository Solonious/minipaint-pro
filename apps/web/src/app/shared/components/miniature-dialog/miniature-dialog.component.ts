import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';
import {
  Army,
  CreateMiniatureDto,
  CreateUnitTemplateDto,
  GameSystem,
  Miniature,
  MiniatureStatus,
  UnitTemplate,
  UpdateMiniatureDto,
} from '@minipaint-pro/types';
import { ArmyService } from '../../../core/services/army.service';
import {
  WahapediaService,
  WahapediaUnit,
} from '../../../core/services/wahapedia.service';
import { UnitTemplateService } from '../../../core/services/unit-template.service';

type DialogStep = 'search' | 'form';

interface SearchResult {
  type: 'library' | 'wahapedia' | 'create';
  template?: UnitTemplate;
  wahapediaUnit?: WahapediaUnit;
  wahapediaFaction?: string;
}

interface StatusOption {
  label: string;
  value: MiniatureStatus;
}

interface GameSystemOption {
  label: string;
  value: GameSystem;
}

const STATUS_OPTIONS: StatusOption[] = [
  { label: 'Unbuilt', value: 'unbuilt' },
  { label: 'Assembled', value: 'assembled' },
  { label: 'Primed', value: 'primed' },
  { label: 'Work in Progress', value: 'wip' },
  { label: 'Painted', value: 'painted' },
  { label: 'Complete', value: 'complete' },
];

const GAME_SYSTEM_OPTIONS: GameSystemOption[] = [
  { label: 'Warhammer 40K', value: 'warhammer40k' },
  { label: 'Age of Sigmar', value: 'ageOfSigmar' },
  { label: 'Kill Team', value: 'killTeam' },
  { label: 'Necromunda', value: 'necromunda' },
  { label: 'Horus Heresy', value: 'horusHeresy' },
  { label: 'Other', value: 'other' },
];

@Component({
  selector: 'app-miniature-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TextareaModule,
    ButtonModule,
    ProgressSpinnerModule,
    DividerModule,
  ],
  template: `
    <p-dialog
      [header]="dialogTitle()"
      [visible]="visible()"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: '520px', maxHeight: '90vh' }"
      (visibleChange)="onVisibleChange($event)"
      styleClass="miniature-dialog"
      appendTo="body"
    >
      @if (isEditMode()) {
        <!-- Edit Mode: Direct form -->
        <ng-container *ngTemplateOutlet="formTemplate"></ng-container>
      } @else {
        <!-- Add Mode: Search-first flow -->
        @if (currentStep() === 'search') {
          <div class="search-step">
            <div class="search-input-container">
              <i class="pi pi-search search-icon"></i>
              <input
                pInputText
                [ngModel]="searchQuery()"
                placeholder="Search for a unit..."
                class="search-input"
                (ngModelChange)="onSearchChange($event)"
                autofocus
              />
            </div>

            <div class="search-results">
              @if (libraryResults().length > 0) {
                <div class="results-section">
                  <div class="section-header">
                    <i class="pi pi-star-fill"></i>
                    <span>Your Library</span>
                  </div>
                  @for (result of libraryResults(); track result.id) {
                    <div
                      class="result-item"
                      (click)="onSelectLibraryTemplate(result)"
                    >
                      <div class="result-info">
                        <span class="result-name">{{ result.name }}</span>
                        <span class="result-meta">
                          {{ result.faction }} ·
                          {{ result.defaultModelCount }} models ·
                          {{ result.defaultPoints }}pts
                        </span>
                      </div>
                      <span class="result-badge">
                        Used {{ result.usageCount }}x
                      </span>
                    </div>
                  }
                </div>
              }

              @if (wahapediaResults().length > 0) {
                <div class="results-section">
                  <div class="section-header">
                    <i class="pi pi-book"></i>
                    <span>Wahapedia</span>
                  </div>
                  @for (result of wahapediaResults(); track result.id) {
                    <div
                      class="result-item"
                      (click)="onSelectWahapediaUnit(result)"
                    >
                      <div class="result-info">
                        <span class="result-name">{{ result.name }}</span>
                        <span class="result-meta">
                          {{ getFactionName(result.factionId) }}
                          @if (result.role) {
                            · {{ result.role }}
                          }
                        </span>
                      </div>
                      <i class="pi pi-external-link result-link-icon"></i>
                    </div>
                  }
                </div>
              }

              @if (searchQuery().length > 0) {
                <div class="results-section create-section">
                  <div
                    class="result-item create-item"
                    (click)="onCreateNew()"
                  >
                    <div class="result-info">
                      <span class="result-name">
                        <i class="pi pi-plus"></i>
                        Create "{{ searchQuery() }}" as new unit
                      </span>
                      <span class="result-meta">
                        Add a custom unit to your library
                      </span>
                    </div>
                  </div>
                </div>
              } @else if (libraryResults().length === 0 && wahapediaResults().length === 0) {
                <div class="empty-state">
                  <i class="pi pi-search"></i>
                  <p>Start typing to search your library and Wahapedia</p>
                </div>
              }
            </div>
          </div>
        } @else {
          <!-- Form Step -->
          <div class="back-button-container">
            <p-button
              label="Back to search"
              icon="pi pi-arrow-left"
              [text]="true"
              severity="secondary"
              (onClick)="onBackToSearch()"
            />
          </div>
          <ng-container *ngTemplateOutlet="formTemplate"></ng-container>
        }
      }

      <ng-template #formTemplate>
        <form class="dialog-form" (ngSubmit)="onSubmit()">
          @if (selectedSource()) {
            <div class="source-badge">
              @if (selectedSource() === 'library') {
                <i class="pi pi-star-fill"></i>
                <span>From your library</span>
              } @else if (selectedSource() === 'wahapedia') {
                <i class="pi pi-book"></i>
                <span>From Wahapedia</span>
              } @else {
                <i class="pi pi-plus"></i>
                <span>New unit</span>
              }
            </div>
          }

          <div class="form-field">
            <label for="name">Name *</label>
            <input
              pInputText
              id="name"
              [(ngModel)]="formData.name"
              name="name"
              placeholder="e.g., Intercessor Squad"
              required
            />
          </div>

          <div class="form-row">
            <div class="form-field">
              <label for="gameSystem">Game System</label>
              <p-select
                id="gameSystem"
                [(ngModel)]="formData.gameSystem"
                name="gameSystem"
                [options]="gameSystemOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select game system"
                (ngModelChange)="onGameSystemChange($event)"
                appendTo="body"
              />
            </div>

            <div class="form-field">
              <label for="army">Army</label>
              <p-select
                id="army"
                [(ngModel)]="formData.armyId"
                name="armyId"
                [options]="armyOptions()"
                optionLabel="name"
                optionValue="id"
                placeholder="No army"
                [showClear]="true"
                (ngModelChange)="onArmyChange($event)"
                appendTo="body"
              />
            </div>
          </div>

          @if (formData.gameSystem === 'warhammer40k') {
            <div class="form-row">
              <div class="form-field">
                <label for="faction">Faction</label>
                @if (wahapediaService.loading()) {
                  <div class="loading-indicator">
                    <p-progressSpinner
                      [style]="{ width: '20px', height: '20px' }"
                      strokeWidth="4"
                    />
                    <span>Loading factions...</span>
                  </div>
                } @else {
                  <p-select
                    id="faction"
                    [(ngModel)]="formData.factionId"
                    name="factionId"
                    [options]="wahapediaService.factions()"
                    optionLabel="name"
                    optionValue="id"
                    [filter]="true"
                    filterPlaceholder="Search factions..."
                    placeholder="Select faction"
                    (ngModelChange)="onFactionChange($event)"
                    appendTo="body"
                  />
                }
              </div>

              <div class="form-field">
                <label for="unit">Unit</label>
                <p-select
                  id="unit"
                  [(ngModel)]="formData.unitId"
                  name="unitId"
                  [options]="availableUnits()"
                  optionLabel="name"
                  optionValue="id"
                  [filter]="true"
                  filterPlaceholder="Search units..."
                  placeholder="Select unit (optional)"
                  [disabled]="!formData.factionId"
                  (ngModelChange)="onUnitChange($event)"
                  [showClear]="true"
                  appendTo="body"
                >
                  <ng-template #item let-unit>
                    <div class="unit-option">
                      <span class="unit-name">{{ unit.name }}</span>
                      @if (unit.role) {
                        <span class="unit-role">{{ unit.role }}</span>
                      }
                    </div>
                  </ng-template>
                </p-select>
              </div>
            </div>
          } @else {
            <div class="form-field">
              <label for="faction">Faction *</label>
              <input
                pInputText
                id="faction"
                [(ngModel)]="formData.faction"
                name="faction"
                placeholder="e.g., Space Marines"
                required
              />
            </div>
          }

          <div class="form-row">
            <div class="form-field">
              <label for="points">Points *</label>
              <p-inputNumber
                id="points"
                [(ngModel)]="formData.points"
                name="points"
                [min]="0"
                [max]="9999"
                placeholder="0"
                required
              />
            </div>

            <div class="form-field">
              <label for="modelCount">Model Count</label>
              <p-inputNumber
                id="modelCount"
                [(ngModel)]="formData.modelCount"
                name="modelCount"
                [min]="1"
                [max]="100"
                placeholder="1"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label for="cost">Cost ($)</label>
              <p-inputNumber
                id="cost"
                [(ngModel)]="formData.cost"
                name="cost"
                [min]="0"
                [max]="9999"
                [minFractionDigits]="2"
                [maxFractionDigits]="2"
                placeholder="0.00"
              />
            </div>

            <div class="form-field">
              <label for="status">Status</label>
              <p-select
                id="status"
                [(ngModel)]="formData.status"
                name="status"
                [options]="statusOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select status"
                appendTo="body"
              />
            </div>
          </div>

          @if (formData.wahapediaUrl) {
            <div class="form-field">
              <span class="field-label">Wahapedia Reference</span>
              <a
                [href]="formData.wahapediaUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="wahapedia-link"
              >
                <i class="pi pi-external-link"></i>
                View on Wahapedia
              </a>
            </div>
          }

          <div class="form-field">
            <label for="imageUrl">Image URL</label>
            <input
              pInputText
              id="imageUrl"
              [(ngModel)]="formData.imageUrl"
              name="imageUrl"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div class="form-field">
            <label for="notes">Notes</label>
            <textarea
              pTextarea
              id="notes"
              [(ngModel)]="formData.notes"
              name="notes"
              rows="3"
              placeholder="Any additional notes..."
            ></textarea>
          </div>
        </form>
      </ng-template>

      <ng-template #footer>
        <div class="dialog-footer">
          @if (isEditMode() && miniature()) {
            <p-button
              label="Delete"
              severity="danger"
              [text]="true"
              icon="pi pi-trash"
              (onClick)="onDelete()"
            />
          }
          <div class="footer-actions">
            <p-button
              label="Cancel"
              severity="secondary"
              [text]="true"
              (onClick)="onCancel()"
            />
            @if (currentStep() === 'form' || isEditMode()) {
              <p-button
                [label]="miniature() ? 'Save' : 'Add to Pile'"
                icon="pi pi-check"
                (onClick)="onSubmit()"
                [disabled]="!isFormValid()"
              />
            }
          </div>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: `
    :host ::ng-deep .miniature-dialog {
      .p-dialog-header {
        background: var(--bg-card);
        border-bottom: 1px solid var(--border-dim);
        padding: var(--space-md) var(--space-lg);
      }

      .p-dialog-title {
        font-family: var(--font-heading);
        font-size: 1.125rem;
        color: var(--text-primary);
      }

      .p-dialog-content {
        background: var(--bg-panel);
        padding: var(--space-lg);
        max-height: 60vh;
        overflow-y: auto;
      }

      .p-dialog-footer {
        background: var(--bg-card);
        border-top: 1px solid var(--border-dim);
        padding: var(--space-md) var(--space-lg);
      }
    }

    .search-step {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }

    .search-input-container {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: var(--space-md);
      color: var(--text-secondary);
      font-size: 1rem;
    }

    .search-input {
      width: 100%;
      padding-left: calc(var(--space-md) * 2 + 1rem) !important;
      font-size: 1rem;
    }

    .search-results {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      max-height: 400px;
      overflow-y: auto;
    }

    .results-section {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-xs) 0;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);

      i {
        font-size: 0.75rem;
      }
    }

    .result-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-sm) var(--space-md);
      background: var(--bg-card);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--bg-elevated);
        border-color: var(--gold);
      }
    }

    .result-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .result-name {
      font-weight: 500;
      color: var(--text-primary);

      i {
        margin-right: var(--space-xs);
        color: var(--gold);
      }
    }

    .result-meta {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .result-badge {
      font-size: 0.75rem;
      padding: 2px var(--space-sm);
      background: var(--bg-elevated);
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
    }

    .result-link-icon {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .create-section {
      margin-top: var(--space-sm);
      padding-top: var(--space-sm);
      border-top: 1px solid var(--border-dim);
    }

    .create-item {
      border-style: dashed;

      .result-name {
        color: var(--gold);
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-xl);
      color: var(--text-secondary);
      text-align: center;

      i {
        font-size: 2rem;
        margin-bottom: var(--space-md);
        opacity: 0.5;
      }

      p {
        margin: 0;
        font-size: 0.875rem;
      }
    }

    .back-button-container {
      margin-bottom: var(--space-md);
    }

    .source-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--space-xs);
      padding: var(--space-xs) var(--space-sm);
      background: var(--bg-card);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-bottom: var(--space-md);

      i {
        color: var(--gold);
        font-size: 0.75rem;
      }
    }

    .dialog-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-md);
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }

    .form-field label,
    .form-field .field-label {
      font-family: var(--font-body);
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .loading-indicator {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-sm);
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .unit-option {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .unit-name {
      font-weight: 500;
      color: var(--text-primary);
    }

    .unit-role {
      font-size: 0.75rem;
      color: var(--text-secondary);
      text-transform: uppercase;
    }

    .wahapedia-link {
      display: inline-flex;
      align-items: center;
      gap: var(--space-xs);
      padding: var(--space-sm) var(--space-md);
      background: var(--bg-card);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-md);
      color: var(--gold);
      text-decoration: none;
      font-size: 0.875rem;
      transition: all 0.2s ease;

      &:hover {
        background: var(--bg-elevated);
        border-color: var(--gold);
      }

      i {
        font-size: 0.75rem;
      }
    }

    .dialog-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .footer-actions {
      display: flex;
      gap: var(--space-sm);
      margin-left: auto;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiniatureDialogComponent {
  private readonly armyService = inject(ArmyService);
  readonly wahapediaService = inject(WahapediaService);
  private readonly unitTemplateService = inject(UnitTemplateService);

  visible = input.required<boolean>();
  miniature = input<Miniature | null>(null);
  defaultArmyId = input<string | undefined>(undefined);

  visibleChange = output<boolean>();
  save = output<CreateMiniatureDto | UpdateMiniatureDto>();
  delete = output<string>();
  templateCreated = output<CreateUnitTemplateDto>();

  readonly statusOptions = STATUS_OPTIONS;
  readonly gameSystemOptions = GAME_SYSTEM_OPTIONS;

  readonly armyOptions = computed<Army[]>(() => this.armyService.armies());

  readonly isEditMode = computed(() => !!this.miniature());

  readonly dialogTitle = computed(() => {
    if (this.miniature()) {
      return 'Edit Miniature';
    }
    return this.currentStep() === 'search' ? 'Add Miniature' : 'Add Miniature';
  });

  private readonly selectedFactionId = signal<string | undefined>(undefined);

  readonly availableUnits = computed<WahapediaUnit[]>(() => {
    const factionId = this.selectedFactionId();
    if (!factionId) return [];
    return this.wahapediaService.getUnitsForFaction(factionId);
  });

  currentStep = signal<DialogStep>('search');
  searchQuery = signal('');
  selectedSource = signal<'library' | 'wahapedia' | 'create' | null>(null);
  selectedTemplateId = signal<string | null>(null);

  readonly libraryResults = computed(() => {
    const query = this.searchQuery();
    if (!query || query.length < 2) {
      return this.unitTemplateService.sortedByUsage().slice(0, 5);
    }
    const lowerQuery = query.toLowerCase();
    return this.unitTemplateService
      .templates()
      .filter(
        (t) =>
          t.name.toLowerCase().includes(lowerQuery) ||
          t.faction.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 10);
  });

  readonly wahapediaResults = computed(() => {
    const query = this.searchQuery();
    if (!query || query.length < 2) {
      return [];
    }
    const lowerQuery = query.toLowerCase();
    return this.wahapediaService
      .units()
      .filter((u) => u.name.toLowerCase().includes(lowerQuery))
      .slice(0, 10);
  });

  formData = {
    name: '',
    faction: '',
    factionId: undefined as string | undefined,
    gameSystem: undefined as GameSystem | undefined,
    unitId: undefined as string | undefined,
    wahapediaUrl: undefined as string | undefined,
    points: 0,
    modelCount: 1,
    cost: undefined as number | undefined,
    status: 'unbuilt' as MiniatureStatus,
    armyId: undefined as string | undefined,
    imageUrl: '',
    notes: '',
  };

  constructor() {
    effect(() => {
      const isVisible = this.visible();
      if (isVisible) {
        untracked(() => this.resetDialog());
      }
    });
  }

  private resetDialog(): void {
    const mini = this.miniature();
    if (mini) {
      this.currentStep.set('form');
      this.selectedSource.set(null);
      this.formData = {
        name: mini.name,
        faction: mini.faction,
        factionId: undefined,
        gameSystem: mini.gameSystem,
        unitId: mini.unitId,
        wahapediaUrl: mini.wahapediaUrl,
        points: mini.points,
        modelCount: mini.modelCount,
        cost: mini.cost,
        status: mini.status,
        armyId: mini.armyId,
        imageUrl: mini.imageUrl ?? '',
        notes: mini.notes ?? '',
      };

      if (mini.gameSystem === 'warhammer40k') {
        this.wahapediaService.loadData(mini.gameSystem);
        const faction = this.wahapediaService
          .factions()
          .find((f) => f.name === mini.faction);
        if (faction) {
          this.formData.factionId = faction.id;
          this.selectedFactionId.set(faction.id);
        }
      }
    } else {
      this.currentStep.set('search');
      this.searchQuery.set('');
      this.selectedSource.set(null);
      this.selectedTemplateId.set(null);

      const defaultArmy = this.defaultArmyId()
        ? this.armyService.getById(this.defaultArmyId()!)
        : undefined;

      this.formData = {
        name: '',
        faction: defaultArmy?.faction ?? '',
        factionId: undefined,
        gameSystem: defaultArmy?.gameSystem,
        unitId: undefined,
        wahapediaUrl: undefined,
        points: 0,
        modelCount: 1,
        cost: undefined,
        status: 'unbuilt',
        armyId: this.defaultArmyId(),
        imageUrl: '',
        notes: '',
      };

      if (defaultArmy?.gameSystem === 'warhammer40k') {
        this.wahapediaService.loadData(defaultArmy.gameSystem);
        const faction = this.wahapediaService
          .factions()
          .find(
            (f) => f.name.toLowerCase() === defaultArmy.faction.toLowerCase()
          );
        if (faction) {
          this.formData.factionId = faction.id;
          this.selectedFactionId.set(faction.id);
        }
      } else {
        this.selectedFactionId.set(undefined);
      }

      // Load Wahapedia data for search
      this.wahapediaService.loadData('warhammer40k');
    }
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  onSelectLibraryTemplate(template: UnitTemplate): void {
    this.selectedSource.set('library');
    this.selectedTemplateId.set(template.id);

    this.formData = {
      ...this.formData,
      name: template.name,
      faction: template.faction,
      gameSystem: template.gameSystem,
      points: template.defaultPoints,
      modelCount: template.defaultModelCount,
      wahapediaUrl: template.wahapediaUrl,
      unitId: template.wahapediaUnitId,
    };

    if (template.gameSystem === 'warhammer40k') {
      this.wahapediaService.loadData(template.gameSystem);
      const faction = this.wahapediaService
        .factions()
        .find((f) => f.name.toLowerCase() === template.faction.toLowerCase());
      if (faction) {
        this.formData.factionId = faction.id;
        this.selectedFactionId.set(faction.id);
      }
    }

    this.currentStep.set('form');
  }

  onSelectWahapediaUnit(unit: WahapediaUnit): void {
    this.selectedSource.set('wahapedia');

    const faction = this.wahapediaService.getFactionById(unit.factionId);

    this.formData = {
      ...this.formData,
      name: unit.name,
      faction: faction?.name ?? '',
      factionId: unit.factionId,
      gameSystem: 'warhammer40k',
      unitId: unit.id,
      wahapediaUrl: unit.link,
    };

    this.selectedFactionId.set(unit.factionId);
    this.currentStep.set('form');
  }

  onCreateNew(): void {
    this.selectedSource.set('create');

    this.formData = {
      ...this.formData,
      name: this.searchQuery(),
    };

    this.currentStep.set('form');
  }

  onBackToSearch(): void {
    this.currentStep.set('search');
  }

  getFactionName(factionId: string): string {
    const faction = this.wahapediaService.getFactionById(factionId);
    return faction?.name ?? 'Unknown';
  }

  onGameSystemChange(gameSystem: GameSystem): void {
    this.formData.factionId = undefined;
    this.formData.unitId = undefined;
    this.formData.wahapediaUrl = undefined;
    this.selectedFactionId.set(undefined);

    if (gameSystem === 'warhammer40k') {
      this.wahapediaService.loadData(gameSystem);
    }
  }

  onArmyChange(armyId: string | undefined): void {
    if (!armyId) {
      return;
    }

    const army = this.armyService.getById(armyId);
    if (!army) {
      return;
    }

    if (army.faction) {
      this.formData.faction = army.faction;

      if (this.formData.gameSystem === 'warhammer40k') {
        const faction = this.wahapediaService
          .factions()
          .find((f) => f.name.toLowerCase() === army.faction.toLowerCase());
        if (faction) {
          this.formData.factionId = faction.id;
          this.selectedFactionId.set(faction.id);
        }
      }
    }
  }

  onFactionChange(factionId: string): void {
    this.selectedFactionId.set(factionId);
    this.formData.unitId = undefined;
    this.formData.wahapediaUrl = undefined;

    const faction = this.wahapediaService.getFactionById(factionId);
    if (faction) {
      this.formData.faction = faction.name;
    }
  }

  onUnitChange(unitId: string): void {
    const unit = this.wahapediaService.getUnitById(unitId);
    if (unit) {
      this.formData.name = unit.name;
      this.formData.wahapediaUrl = unit.link;
    }
  }

  isFormValid(): boolean {
    const hasName = this.formData.name.trim().length > 0;
    const hasFaction =
      this.formData.gameSystem === 'warhammer40k'
        ? !!this.formData.factionId
        : this.formData.faction.trim().length > 0;
    const hasPoints = this.formData.points >= 0;

    return hasName && hasFaction && hasPoints;
  }

  onVisibleChange(visible: boolean): void {
    if (!visible) {
      this.resetDialog();
    }
    this.visibleChange.emit(visible);
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      return;
    }

    const dto: CreateMiniatureDto | UpdateMiniatureDto = {
      name: this.formData.name.trim(),
      faction: this.formData.faction.trim(),
      gameSystem: this.formData.gameSystem,
      unitId: this.formData.unitId,
      wahapediaUrl: this.formData.wahapediaUrl,
      points: this.formData.points,
      modelCount: this.formData.modelCount,
      cost: this.formData.cost,
      status: this.formData.status,
      armyId: this.formData.armyId,
      imageUrl: this.formData.imageUrl.trim() || undefined,
      notes: this.formData.notes.trim() || undefined,
    };

    // If used from library, increment usage
    const templateId = this.selectedTemplateId();
    if (this.selectedSource() === 'library' && templateId) {
      this.unitTemplateService.incrementUsage(templateId);
    }

    // Create template if this is a new entry
    if (!this.miniature() && this.formData.gameSystem) {
      const templateDto: CreateUnitTemplateDto = {
        name: this.formData.name.trim(),
        faction: this.formData.faction.trim(),
        gameSystem: this.formData.gameSystem,
        defaultPoints: this.formData.points,
        defaultModelCount: this.formData.modelCount,
        wahapediaUnitId: this.formData.unitId,
        wahapediaUrl: this.formData.wahapediaUrl,
      };
      this.templateCreated.emit(templateDto);
    }

    this.save.emit(dto);
    this.visibleChange.emit(false);
  }

  onCancel(): void {
    this.visibleChange.emit(false);
  }

  onDelete(): void {
    const mini = this.miniature();
    if (mini) {
      this.delete.emit(mini.id);
      this.visibleChange.emit(false);
    }
  }
}
