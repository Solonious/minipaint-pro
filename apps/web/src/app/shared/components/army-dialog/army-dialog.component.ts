import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ColorPicker } from 'primeng/colorpicker';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import {
  Army,
  CreateArmyDto,
  GameSystem,
  UpdateArmyDto,
} from '@minipaint-pro/types';
import { WahapediaService } from '../../../core/services/wahapedia.service';
import { FactionImageService } from '../../../core/services/faction-image.service';

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

interface FactionOption {
  label: string;
  value: string;
  iconId: string;
  category: 'imperium' | 'chaos' | 'xenos' | 'chapter';
}

// Mapping from faction names (including Wahapedia names) to icon IDs
const FACTION_ICON_MAP: Record<string, string> = {
  // Imperium
  'Space Marines': 'adeptus-astartes',
  'Adeptus Astartes': 'adeptus-astartes',
  'Astra Militarum': 'astra-militarum',
  'Imperial Guard': 'astra-militarum',
  'Adeptus Mechanicus': 'adeptus-mechanicus',
  'Adeptus Custodes': 'adeptus-custodes',
  'Sisters of Battle': 'sisters-of-battle',
  'Adepta Sororitas': 'sisters-of-battle',
  'Imperial Knights': 'imperial-knights',
  'Inquisition': 'inquisition',
  'Imperial Agents': 'imperial-aquila',
  'Agents of the Imperium': 'imperial-aquila',
  // Space Marine Chapters
  'Ultramarines': 'ultramarines',
  'Blood Angels': 'blood-angels',
  'Dark Angels': 'dark-angels',
  'Space Wolves': 'space-wolves',
  'Imperial Fists': 'imperial-fists',
  'Iron Hands': 'iron-hands',
  'Raven Guard': 'raven-guard',
  'Salamanders': 'salamanders',
  'White Scars': 'white-scars',
  'Black Templars': 'adeptus-astartes',
  'Deathwatch': 'adeptus-astartes',
  'Grey Knights': 'adeptus-astartes',
  // Chaos
  'Chaos Space Marines': 'chaos',
  'Heretic Astartes': 'chaos',
  'Black Legion': 'black-legion',
  'Death Guard': 'death-guard',
  'Thousand Sons': 'thousand-sons',
  'World Eaters': 'world-eaters',
  "Emperor's Children": 'emperors-children',
  'Chaos Knights': 'chaos-knights',
  'Chaos Daemons': 'chaos-daemons',
  'Daemons of Chaos': 'chaos-daemons',
  'Legiones Daemonica': 'chaos-daemons',
  // Xenos
  'Orks': 'orks',
  'Aeldari': 'aeldari',
  'Craftworlds': 'aeldari',
  'Drukhari': 'drukhari',
  'Tyranids': 'tyranids',
  'Necrons': 'necrons',
  "T'au Empire": 'tau',
  'Tau Empire': 'tau',
  'Genestealer Cults': 'genestealer-cults',
  'Leagues of Votann': 'leagues-of-votann',
  'Votann': 'leagues-of-votann',
};

const FACTION_OPTIONS: FactionOption[] = [
  // Imperium
  { label: 'Space Marines', value: 'Space Marines', iconId: 'adeptus-astartes', category: 'imperium' },
  { label: 'Astra Militarum', value: 'Astra Militarum', iconId: 'astra-militarum', category: 'imperium' },
  { label: 'Adeptus Mechanicus', value: 'Adeptus Mechanicus', iconId: 'adeptus-mechanicus', category: 'imperium' },
  { label: 'Adeptus Custodes', value: 'Adeptus Custodes', iconId: 'adeptus-custodes', category: 'imperium' },
  { label: 'Sisters of Battle', value: 'Sisters of Battle', iconId: 'sisters-of-battle', category: 'imperium' },
  { label: 'Imperial Knights', value: 'Imperial Knights', iconId: 'imperial-knights', category: 'imperium' },
  { label: 'Inquisition', value: 'Inquisition', iconId: 'inquisition', category: 'imperium' },
  { label: 'Imperial Agents', value: 'Imperial Agents', iconId: 'imperial-aquila', category: 'imperium' },
  // Space Marine Chapters
  { label: 'Ultramarines', value: 'Ultramarines', iconId: 'ultramarines', category: 'chapter' },
  { label: 'Blood Angels', value: 'Blood Angels', iconId: 'blood-angels', category: 'chapter' },
  { label: 'Dark Angels', value: 'Dark Angels', iconId: 'dark-angels', category: 'chapter' },
  { label: 'Space Wolves', value: 'Space Wolves', iconId: 'space-wolves', category: 'chapter' },
  { label: 'Imperial Fists', value: 'Imperial Fists', iconId: 'imperial-fists', category: 'chapter' },
  { label: 'Iron Hands', value: 'Iron Hands', iconId: 'iron-hands', category: 'chapter' },
  { label: 'Raven Guard', value: 'Raven Guard', iconId: 'raven-guard', category: 'chapter' },
  { label: 'Salamanders', value: 'Salamanders', iconId: 'salamanders', category: 'chapter' },
  { label: 'White Scars', value: 'White Scars', iconId: 'white-scars', category: 'chapter' },
  // Chaos
  { label: 'Chaos Space Marines', value: 'Chaos Space Marines', iconId: 'chaos', category: 'chaos' },
  { label: 'Black Legion', value: 'Black Legion', iconId: 'black-legion', category: 'chaos' },
  { label: 'Death Guard', value: 'Death Guard', iconId: 'death-guard', category: 'chaos' },
  { label: 'Thousand Sons', value: 'Thousand Sons', iconId: 'thousand-sons', category: 'chaos' },
  { label: 'World Eaters', value: 'World Eaters', iconId: 'world-eaters', category: 'chaos' },
  { label: "Emperor's Children", value: "Emperor's Children", iconId: 'emperors-children', category: 'chaos' },
  { label: 'Chaos Knights', value: 'Chaos Knights', iconId: 'chaos-knights', category: 'chaos' },
  { label: 'Chaos Daemons', value: 'Chaos Daemons', iconId: 'chaos-daemons', category: 'chaos' },
  // Xenos
  { label: 'Orks', value: 'Orks', iconId: 'orks', category: 'xenos' },
  { label: 'Aeldari', value: 'Aeldari', iconId: 'aeldari', category: 'xenos' },
  { label: 'Drukhari', value: 'Drukhari', iconId: 'drukhari', category: 'xenos' },
  { label: 'Tyranids', value: 'Tyranids', iconId: 'tyranids', category: 'xenos' },
  { label: 'Necrons', value: 'Necrons', iconId: 'necrons', category: 'xenos' },
  { label: "T'au Empire", value: "T'au Empire", iconId: 'tau', category: 'xenos' },
  { label: 'Genestealer Cults', value: 'Genestealer Cults', iconId: 'genestealer-cults', category: 'xenos' },
  { label: 'Leagues of Votann', value: 'Leagues of Votann', iconId: 'leagues-of-votann', category: 'xenos' },
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
    ProgressSpinnerModule,
    TooltipModule,
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

        <div class="form-field">
          <label for="gameSystem">Game System *</label>
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

        @if (formData.gameSystem) {
          <div class="form-field">
            <label for="faction">Faction *</label>
            @if (formData.gameSystem === 'warhammer40k') {
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
                  (ngModelChange)="onWahapediaFactionChange($event)"
                  appendTo="body"
                />
              }
            } @else {
              <p-select
                id="faction"
                [(ngModel)]="formData.faction"
                name="faction"
                [options]="factionOptions"
                optionLabel="label"
                optionValue="value"
                [filter]="true"
                filterPlaceholder="Search factions..."
                placeholder="Select faction"
                (ngModelChange)="onFactionChange($event)"
                styleClass="faction-select"
                appendTo="body"
              >
                <ng-template #selectedItem let-selected>
                  @if (selected) {
                    <div class="faction-option">
                      <img
                        [src]="'assets/icons/factions/' + selected.iconId + '.svg'"
                        [alt]="selected.label"
                        class="faction-option-icon"
                      />
                      <span>{{ selected.label }}</span>
                    </div>
                  }
                </ng-template>
                <ng-template #item let-option>
                  <div class="faction-option">
                    <img
                      [src]="'assets/icons/factions/' + option.iconId + '.svg'"
                      [alt]="option.label"
                      class="faction-option-icon"
                    />
                    <span>{{ option.label }}</span>
                  </div>
                </ng-template>
              </p-select>
            }
          </div>
        }

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
                #colorPicker
                [(ngModel)]="formData.colorHex"
                name="colorHex"
                [inline]="false"
                format="hex"
                appendTo="body"
              />
              <span class="color-preview" [style.background-color]="formData.colorHex || 'var(--bg-elevated)'"></span>
            </div>
          </div>
        </div>

        @if (formData.iconEmoji) {
          <div class="form-field">
            <span class="field-label">Selected Icon</span>
            <div class="selected-icon-preview">
              <img
                [src]="'assets/icons/factions/' + formData.iconEmoji + '.svg'"
                [alt]="formData.faction"
                class="preview-icon"
              />
              <span class="preview-label">{{ formData.faction }}</span>
            </div>
          </div>
        }

        <!-- Background Image Section -->
        <div class="form-field">
          <label for="backgroundImageUrl">Background Image URL</label>
          <div class="image-url-input">
            <input
              pInputText
              id="backgroundImageUrl"
              [(ngModel)]="formData.backgroundImageUrl"
              name="backgroundImageUrl"
              placeholder="Paste image URL here..."
            />
            <p-button
              icon="pi pi-external-link"
              [rounded]="true"
              [text]="true"
              severity="secondary"
              size="small"
              pTooltip="Search for images"
              tooltipPosition="top"
              (onClick)="openImageSearch()"
            />
          </div>
          <span class="field-hint">
            Find artwork on
            <a [href]="searchUrl()" target="_blank" rel="noopener">WallpaperFlare</a>
            or
            <a [href]="alphaCodersSearchUrl()" target="_blank" rel="noopener">Alpha Coders</a>
          </span>
        </div>

        @if (formData.backgroundImageUrl || defaultImageUrl()) {
          <div class="form-field">
            <span class="field-label">Image Preview</span>
            <div class="image-preview-container">
              <img
                [src]="formData.backgroundImageUrl || defaultImageUrl()"
                alt="Army background preview"
                class="image-preview"
                (error)="onImageError()"
              />
              @if (imageError()) {
                <div class="image-error">
                  <i class="pi pi-exclamation-triangle"></i>
                  <span>Unable to load image</span>
                </div>
              }
              @if (formData.backgroundImageUrl) {
                <p-button
                  icon="pi pi-times"
                  [rounded]="true"
                  [text]="true"
                  severity="danger"
                  size="small"
                  class="clear-image-btn"
                  pTooltip="Use default image"
                  tooltipPosition="top"
                  (onClick)="clearBackgroundImage()"
                />
              }
            </div>
          </div>
        }
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

    .loading-indicator {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-sm);
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .faction-option {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }

    .faction-option-icon {
      width: 24px;
      height: 24px;
      object-fit: contain;
      filter: brightness(0) invert(0.85);
    }

    .selected-icon-preview {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-md);
      background: var(--bg-card);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-md);
    }

    .preview-icon {
      width: 48px;
      height: 48px;
      object-fit: contain;
      filter: brightness(0) invert(0.85);
    }

    .preview-label {
      font-family: var(--font-body);
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    :host ::ng-deep .faction-select {
      .p-select-label {
        display: flex;
        align-items: center;
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

    .image-url-input {
      display: flex;
      gap: var(--space-xs);
      align-items: center;

      input {
        flex: 1;
      }
    }

    .field-hint {
      font-size: 0.75rem;
      color: var(--text-dim);
      margin-top: var(--space-xs);

      a {
        color: var(--gold);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .image-preview-container {
      position: relative;
      width: 100%;
      height: 140px;
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 1px solid var(--border-dim);
      background: var(--bg-elevated);
    }

    .image-preview {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-error {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-xs);
      background: rgba(0, 0, 0, 0.7);
      color: var(--error);
      font-size: 0.75rem;

      i {
        font-size: 1.5rem;
      }
    }

    .clear-image-btn {
      position: absolute;
      top: var(--space-xs);
      right: var(--space-xs);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArmyDialogComponent {
  readonly wahapediaService = inject(WahapediaService);
  private readonly factionImageService = inject(FactionImageService);

  visible = input.required<boolean>();
  army = input<Army | null>(null);

  visibleChange = output<boolean>();
  save = output<CreateArmyDto | UpdateArmyDto>();
  delete = output<string>();

  private readonly colorPicker = viewChild<ColorPicker>('colorPicker');

  readonly gameSystemOptions = GAME_SYSTEM_OPTIONS;
  readonly factionOptions = FACTION_OPTIONS;

  readonly imageError = signal<boolean>(false);

  readonly dialogTitle = computed(() =>
    this.army() ? 'Edit Army' : 'Create Army'
  );

  readonly searchUrl = computed(() =>
    this.factionImageService.getSearchUrl(this.formData.iconEmoji)
  );

  readonly alphaCodersSearchUrl = computed(() =>
    this.factionImageService.getAlphaCodersSearchUrl(this.formData.iconEmoji)
  );

  readonly defaultImageUrl = computed(() =>
    this.factionImageService.getDefaultImageForFaction(this.formData.iconEmoji)
  );

  formData = {
    name: '',
    faction: '',
    factionId: undefined as string | undefined,
    gameSystem: undefined as GameSystem | undefined,
    targetPoints: 2000,
    iconEmoji: undefined as string | undefined,
    colorHex: '#3d5a6b',
    backgroundImageUrl: undefined as string | undefined,
  };

  constructor() {
    effect(() => {
      if (this.visible()) {
        this.resetForm();
      }
    });
  }

  private resetForm(): void {
    this.imageError.set(false);
    const existingArmy = this.army();
    if (existingArmy) {
      this.formData = {
        name: existingArmy.name,
        faction: existingArmy.faction,
        factionId: undefined,
        gameSystem: existingArmy.gameSystem,
        targetPoints: existingArmy.targetPoints,
        iconEmoji: existingArmy.iconEmoji,
        colorHex: existingArmy.colorHex ?? '#3d5a6b',
        backgroundImageUrl: existingArmy.backgroundImageUrl,
      };

      // Load Wahapedia data and find matching faction for 40K armies
      if (existingArmy.gameSystem === 'warhammer40k') {
        this.wahapediaService.loadData(existingArmy.gameSystem);
        const faction = this.wahapediaService
          .factions()
          .find((f) => f.name === existingArmy.faction);
        if (faction) {
          this.formData.factionId = faction.id;
        }
      }
    } else {
      this.formData = {
        name: '',
        faction: '',
        factionId: undefined,
        gameSystem: undefined,
        targetPoints: 2000,
        iconEmoji: undefined,
        colorHex: '#3d5a6b',
        backgroundImageUrl: undefined,
      };
    }
  }

  isFormValid(): boolean {
    const hasName = this.formData.name.trim().length > 0;
    const hasGameSystem = !!this.formData.gameSystem;
    const hasFaction =
      this.formData.gameSystem === 'warhammer40k'
        ? !!this.formData.factionId
        : this.formData.faction.trim().length > 0;
    const hasTargetPoints = this.formData.targetPoints > 0;

    return hasName && hasGameSystem && hasFaction && hasTargetPoints;
  }

  selectEmoji(emoji: string | undefined): void {
    this.formData.iconEmoji = emoji;
  }

  onGameSystemChange(gameSystem: GameSystem): void {
    // Clear faction data when game system changes
    this.formData.faction = '';
    this.formData.factionId = undefined;
    this.formData.iconEmoji = undefined;

    // Load Wahapedia data for 40K
    if (gameSystem === 'warhammer40k') {
      this.wahapediaService.loadData(gameSystem);
    }
  }

  onWahapediaFactionChange(factionId: string): void {
    const faction = this.wahapediaService.getFactionById(factionId);
    if (faction) {
      this.formData.faction = faction.name;
      // Map Wahapedia faction name to icon ID
      this.formData.iconEmoji = FACTION_ICON_MAP[faction.name] || 'imperial-aquila';
    }
  }

  onFactionChange(factionValue: string): void {
    const selectedFaction = FACTION_OPTIONS.find(f => f.value === factionValue);
    if (selectedFaction) {
      this.formData.iconEmoji = selectedFaction.iconId;
    }
  }

  onVisibleChange(visible: boolean): void {
    if (!visible) {
      this.resetForm();
      const picker = this.colorPicker();
      if (picker) {
        picker.overlayVisible = false;
      }
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
      backgroundImageUrl: this.formData.backgroundImageUrl || undefined,
    };

    this.save.emit(dto);
    this.visibleChange.emit(false);
  }

  openImageSearch(): void {
    window.open(this.searchUrl(), '_blank', 'noopener');
  }

  onImageError(): void {
    this.imageError.set(true);
  }

  clearBackgroundImage(): void {
    this.formData.backgroundImageUrl = undefined;
    this.imageError.set(false);
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
