import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { PaintBrand, PaintType, PaintWithOwnership } from '@minipaint-pro/types';
import { PaintService, PaintFilters } from '../../core/services/paint.service';
import { PaintCardComponent } from '../../shared/components/paint-card/paint-card.component';

interface SelectOption<T> {
  label: string;
  value: T;
}

const BRAND_OPTIONS: SelectOption<PaintBrand | null>[] = [
  { label: 'All Brands', value: null },
  { label: 'Citadel', value: 'citadel' },
  { label: 'Vallejo', value: 'vallejo' },
  { label: 'Army Painter', value: 'armyPainter' },
  { label: 'Scale75', value: 'scale75' },
  { label: 'AK Interactive', value: 'akInteractive' },
  { label: 'Turbo Dork', value: 'turboDork' },
  { label: 'Other', value: 'other' },
];

const TYPE_OPTIONS: SelectOption<PaintType | null>[] = [
  { label: 'All Types', value: null },
  { label: 'Base', value: 'base' },
  { label: 'Layer', value: 'layer' },
  { label: 'Shade', value: 'shade' },
  { label: 'Contrast', value: 'contrast' },
  { label: 'Technical', value: 'technical' },
  { label: 'Dry', value: 'dry' },
  { label: 'Air', value: 'air' },
  { label: 'Metallic', value: 'metallic' },
];

const OWNERSHIP_OPTIONS: SelectOption<PaintFilters['ownership']>[] = [
  { label: 'All', value: 'all' },
  { label: 'Owned', value: 'owned' },
  { label: 'Unowned', value: 'unowned' },
  { label: 'Wishlist', value: 'wishlist' },
];

@Component({
  selector: 'app-paint-collection',
  standalone: true,
  imports: [
    FormsModule,
    InputTextModule,
    SelectModule,
    SelectButtonModule,
    PaintCardComponent,
  ],
  templateUrl: './paint-collection.component.html',
  styleUrl: './paint-collection.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaintCollectionComponent {
  private readonly paintService = inject(PaintService);

  readonly brandOptions = BRAND_OPTIONS;
  readonly typeOptions = TYPE_OPTIONS;
  readonly ownershipOptions = OWNERSHIP_OPTIONS;

  readonly totalCount = this.paintService.totalCount;
  readonly ownedCount = this.paintService.ownedCount;
  readonly wishlistCount = this.paintService.wishlistCount;

  readonly searchQuery = signal('');
  readonly selectedBrand = signal<PaintBrand | null>(null);
  readonly selectedType = signal<PaintType | null>(null);
  readonly selectedOwnership = signal<PaintFilters['ownership']>('all');

  readonly filteredPaints = computed<PaintWithOwnership[]>(() => {
    const filters: PaintFilters = {
      search: this.searchQuery(),
      brand: this.selectedBrand(),
      type: this.selectedType(),
      ownership: this.selectedOwnership(),
    };
    return this.paintService.getFilteredPaints(filters);
  });

  readonly filteredCount = computed(() => this.filteredPaints().length);

  readonly unownedCount = computed(() => this.totalCount() - this.ownedCount());

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  onBrandChange(value: PaintBrand | null): void {
    this.selectedBrand.set(value);
  }

  onTypeChange(value: PaintType | null): void {
    this.selectedType.set(value);
  }

  onOwnershipChange(value: PaintFilters['ownership']): void {
    this.selectedOwnership.set(value);
  }

  onToggleOwned(paintId: string): void {
    this.paintService.toggleOwned(paintId);
  }

  onToggleWishlist(paintId: string): void {
    this.paintService.toggleWishlist(paintId);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedBrand.set(null);
    this.selectedType.set(null);
    this.selectedOwnership.set('all');
  }
}
