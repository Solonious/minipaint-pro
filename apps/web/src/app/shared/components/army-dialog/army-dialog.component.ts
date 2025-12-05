import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { ColorPickerModule } from 'primeng/colorpicker';
import {
  Army,
  CreateArmyDto,
  GameSystem,
  UpdateArmyDto,
} from '@minipaint-pro/types';

interface GameSystemOption {
  label: string;
  value: GameSystem;
}

const GAME_SYSTEM_OPTIONS: GameSystemOption[] = [
  { label: 'Warhammer 40K', value: 'warhammer40k' },
  { label: 'Age of Sigmar', value: 'ageOfSigmar' },
  { label: 'Kill Team', value: 'killTeam' },
  { label: 'Necromunda', value: 'necromunda' },
  { label: 'Horus Heresy', value: 'horusHeresy' },
  { label: 'Other', value: 'other' },
];

const FACTION_EMOJIS = [
  '⚔️', '🛡️', '🔥', '💀', '🦅', '🐺', '🐉', '👽',
  '🤖', '🧙', '🏛️', '⭐', '☠️', '🌙', '🦁', '🐍',
];

@Component({
  selector: 'app-army-dialog',
  standalone: true,
  imports: [
    FormsModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    ButtonModule,
    ColorPickerModule,
  ],
  template: `
    <p-dialog
      [header]="dialogTitle()"
      [visible]="visible()"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: '480px' }"
      (visibleChange)="onVisibleChange($event)"
      styleClass="army-dialog"
    >
      <form class="dialog-form" (ngSubmit)="onSubmit()">
        <div class="form-field">
          <label for="name">Army Name *</label>
          <input
            pInputText
            id="name"
            [(ngModel)]="formData.name"
            name="name"
            placeholder="e.g., Ultramarines 2nd Company"
            required
          />
        </div>

        <div class="form-row">
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

          <div class="form-field">
            <label for="gameSystem">Game System *</label>
            <p-select
              id="gameSystem"
              [(ngModel)]="formData.gameSystem"
              name="gameSystem"
              [options]="gameSystemOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select game"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="targetPoints">Target Points *</label>
            <p-inputNumber
              id="targetPoints"
              [(ngModel)]="formData.targetPoints"
              name="targetPoints"
              [min]="0"
              [max]="99999"
              placeholder="2000"
              required
            />
          </div>

          <div class="form-field">
            <label for="colorHex">Army Color</label>
            <div class="color-picker-wrapper">
              <p-colorPicker
                [(ngModel)]="formData.colorHex"
                name="colorHex"
                [inline]="false"
                format="hex"
              />
              <span class="color-preview" [style.background-color]="formData.colorHex || 'var(--bg-elevated)'"></span>
            </div>
          </div>
        </div>

        <div class="form-field">
          <span class="field-label">Icon Emoji</span>
          <div class="emoji-grid" role="group" aria-label="Select army icon emoji">
            @for (emoji of factionEmojis; track emoji) {
              <button
                type="button"
                class="emoji-button"
                [class.selected]="formData.iconEmoji === emoji"
                (click)="selectEmoji(emoji)"
              >
                {{ emoji }}
              </button>
            }
            <button
              type="button"
              class="emoji-button clear-button"
              [class.selected]="!formData.iconEmoji"
              (click)="selectEmoji(undefined)"
            >
              ✕
            </button>
          </div>
        </div>
      </form>

      <ng-template #footer>
        <div class="dialog-footer">
          @if (army()) {
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
              [label]="army() ? 'Save' : 'Create'"
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
    :host ::ng-deep .army-dialog {
      .p-dialog-header {
        background: var(--bg-card);
        border-bottom: 1px solid var(--border-dim);
        padding: var(--space-md) var(--space-lg);
      }

      .p-dialog-title {
        font-family: 'Cinzel', serif;
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
      font-family: 'Rajdhani', sans-serif;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .color-picker-wrapper {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }

    .color-preview {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-dim);
    }

    .emoji-grid {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-xs);
    }

    .emoji-button {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      background: var(--bg-card);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        border-color: var(--border-glow);
        background: var(--bg-elevated);
      }

      &.selected {
        border-color: var(--gold);
        box-shadow: 0 0 8px rgba(201, 162, 39, 0.3);
      }

      &.clear-button {
        font-size: 0.875rem;
        color: var(--text-dim);
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
export class ArmyDialogComponent implements OnInit {
  visible = input.required<boolean>();
  army = input<Army | null>(null);

  visibleChange = output<boolean>();
  save = output<CreateArmyDto | UpdateArmyDto>();
  delete = output<string>();

  readonly gameSystemOptions = GAME_SYSTEM_OPTIONS;
  readonly factionEmojis = FACTION_EMOJIS;

  readonly dialogTitle = computed(() =>
    this.army() ? 'Edit Army' : 'Create Army'
  );

  formData = {
    name: '',
    faction: '',
    gameSystem: 'warhammer40k' as GameSystem,
    targetPoints: 2000,
    iconEmoji: undefined as string | undefined,
    colorHex: '#3d5a6b',
  };

  ngOnInit(): void {
    this.resetForm();
  }

  private resetForm(): void {
    const existingArmy = this.army();
    if (existingArmy) {
      this.formData = {
        name: existingArmy.name,
        faction: existingArmy.faction,
        gameSystem: existingArmy.gameSystem,
        targetPoints: existingArmy.targetPoints,
        iconEmoji: existingArmy.iconEmoji,
        colorHex: existingArmy.colorHex ?? '#3d5a6b',
      };
    } else {
      this.formData = {
        name: '',
        faction: '',
        gameSystem: 'warhammer40k',
        targetPoints: 2000,
        iconEmoji: undefined,
        colorHex: '#3d5a6b',
      };
    }
  }

  isFormValid(): boolean {
    return (
      this.formData.name.trim().length > 0 &&
      this.formData.faction.trim().length > 0 &&
      this.formData.targetPoints > 0
    );
  }

  selectEmoji(emoji: string | undefined): void {
    this.formData.iconEmoji = emoji;
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

    const dto: CreateArmyDto | UpdateArmyDto = {
      name: this.formData.name.trim(),
      faction: this.formData.faction.trim(),
      gameSystem: this.formData.gameSystem,
      targetPoints: this.formData.targetPoints,
      iconEmoji: this.formData.iconEmoji,
      colorHex: this.formData.colorHex || undefined,
    };

    this.save.emit(dto);
    this.visibleChange.emit(false);
  }

  onCancel(): void {
    this.visibleChange.emit(false);
  }

  onDelete(): void {
    const existingArmy = this.army();
    if (existingArmy) {
      this.delete.emit(existingArmy.id);
      this.visibleChange.emit(false);
    }
  }
}
