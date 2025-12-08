import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import {
  Army,
  CreateMiniatureDto,
  GameSystem,
  Miniature,
  MiniatureStatus,
  UpdateMiniatureDto,
} from '@minipaint-pro/types';
import { ArmyService } from '../../../core/services/army.service';
import {
  WahapediaService,
  WahapediaUnit,
} from '../../../core/services/wahapedia.service';

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
    FormsModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TextareaModule,
    ButtonModule,
    ProgressSpinnerModule,
  ],
  template: `
    <p-dialog
      [header]="dialogTitle()"
      [visible]="visible()"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: '520px' }"
      (visibleChange)="onVisibleChange($event)"
      styleClass="miniature-dialog"
      appendTo="body"
    >
      <form class="dialog-form" (ngSubmit)="onSubmit()">
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

      <ng-template #footer>
        <div class="dialog-footer">
          @if (miniature()) {
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
            <p-button
              [label]="miniature() ? 'Save' : 'Add'"
              icon="pi pi-check"
              (onClick)="onSubmit()"
              [disabled]="!isFormValid()"
            />
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
      }

      .p-dialog-footer {
        background: var(--bg-card);
        border-top: 1px solid var(--border-dim);
        padding: var(--space-md) var(--space-lg);
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

  visible = input.required<boolean>();
  miniature = input<Miniature | null>(null);

  visibleChange = output<boolean>();
  save = output<CreateMiniatureDto | UpdateMiniatureDto>();
  delete = output<string>();

  readonly statusOptions = STATUS_OPTIONS;
  readonly gameSystemOptions = GAME_SYSTEM_OPTIONS;

  readonly armyOptions = computed<Army[]>(() => this.armyService.armies());

  readonly dialogTitle = computed(() =>
    this.miniature() ? 'Edit Miniature' : 'Add Miniature'
  );

  private readonly selectedFactionId = signal<string | undefined>(undefined);

  readonly availableUnits = computed<WahapediaUnit[]>(() => {
    const factionId = this.selectedFactionId();
    if (!factionId) return [];
    return this.wahapediaService.getUnitsForFaction(factionId);
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
      if (this.visible()) {
        this.resetForm();
      }
    });
  }

  private resetForm(): void {
    const mini = this.miniature();
    if (mini) {
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
      this.formData = {
        name: '',
        faction: '',
        factionId: undefined,
        gameSystem: undefined,
        unitId: undefined,
        wahapediaUrl: undefined,
        points: 0,
        modelCount: 1,
        cost: undefined,
        status: 'unbuilt',
        armyId: undefined,
        imageUrl: '',
        notes: '',
      };
      this.selectedFactionId.set(undefined);
    }
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

    // Auto-fill faction from the selected army
    if (army.faction) {
      this.formData.faction = army.faction;

      // If game system is warhammer40k, try to match the faction in wahapedia
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
      this.resetForm();
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
