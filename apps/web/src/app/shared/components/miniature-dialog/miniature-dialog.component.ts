import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import {
  Army,
  CreateMiniatureDto,
  Miniature,
  MiniatureStatus,
  UpdateMiniatureDto,
} from '@minipaint-pro/types';
import { ArmyService } from '../../../core/services/army.service';

interface StatusOption {
  label: string;
  value: MiniatureStatus;
}

const STATUS_OPTIONS: StatusOption[] = [
  { label: 'Unbuilt', value: 'unbuilt' },
  { label: 'Assembled', value: 'assembled' },
  { label: 'Primed', value: 'primed' },
  { label: 'Work in Progress', value: 'wip' },
  { label: 'Painted', value: 'painted' },
  { label: 'Complete', value: 'complete' },
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
      styleClass="miniature-dialog"
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
        </div>

        <div class="form-row">
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
        </div>

        <div class="form-row">
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
            />
          </div>
        </div>

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

    .form-field label {
      font-family: 'Rajdhani', sans-serif;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
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
export class MiniatureDialogComponent implements OnInit {
  private readonly armyService = inject(ArmyService);

  visible = input.required<boolean>();
  miniature = input<Miniature | null>(null);

  visibleChange = output<boolean>();
  save = output<CreateMiniatureDto | UpdateMiniatureDto>();
  delete = output<string>();

  readonly statusOptions = STATUS_OPTIONS;

  readonly armyOptions = computed<Army[]>(() => this.armyService.armies());

  readonly dialogTitle = computed(() =>
    this.miniature() ? 'Edit Miniature' : 'Add Miniature'
  );

  formData = {
    name: '',
    faction: '',
    points: 0,
    modelCount: 1,
    cost: undefined as number | undefined,
    status: 'unbuilt' as MiniatureStatus,
    armyId: undefined as string | undefined,
    imageUrl: '',
    notes: '',
  };

  ngOnInit(): void {
    this.resetForm();
  }

  private resetForm(): void {
    const mini = this.miniature();
    if (mini) {
      this.formData = {
        name: mini.name,
        faction: mini.faction,
        points: mini.points,
        modelCount: mini.modelCount,
        cost: mini.cost,
        status: mini.status,
        armyId: mini.armyId,
        imageUrl: mini.imageUrl ?? '',
        notes: mini.notes ?? '',
      };
    } else {
      this.formData = {
        name: '',
        faction: '',
        points: 0,
        modelCount: 1,
        cost: undefined,
        status: 'unbuilt',
        armyId: undefined,
        imageUrl: '',
        notes: '',
      };
    }
  }

  isFormValid(): boolean {
    return (
      this.formData.name.trim().length > 0 &&
      this.formData.faction.trim().length > 0 &&
      this.formData.points >= 0
    );
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
