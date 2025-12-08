import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MiniatureService } from '../../core/services/miniature.service';
import { MiniCardComponent } from '../../shared/components/mini-card/mini-card.component';
import { PageLoaderComponent } from '../../shared/components/loading-skeleton/page-loader.component';
import { Miniature, GameSystem } from '@minipaint-pro/types';

interface GameSystemOption {
  label: string;
  value: GameSystem | null;
}

@Component({
  selector: 'app-miniature-library',
  standalone: true,
  imports: [
    FormsModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    SelectModule,
    ButtonModule,
    MiniCardComponent,
    PageLoaderComponent,
  ],
  template: `
    <div class="library-container">
      <header class="library-header">
        <h1>Miniature Library</h1>
        <p class="subtitle">Browse and explore your miniature collection</p>
      </header>

      <div class="filters">
        <p-iconfield class="search-input">
          <p-inputicon styleClass="pi pi-search" />
          <input
            type="text"
            pInputText
            placeholder="Search miniatures..."
            [(ngModel)]="searchQuery"
          />
        </p-iconfield>

        <p-select
          [options]="gameSystemOptions"
          [(ngModel)]="selectedGameSystem"
          optionLabel="label"
          optionValue="value"
          placeholder="All Game Systems"
          [showClear]="true"
          class="game-system-filter"
        />
      </div>

      @if (loading()) {
        <app-page-loader />
      } @else {
        @if (filteredMiniatures().length === 0) {
          <div class="empty-state">
            <i class="pi pi-box"></i>
            <p>No miniatures found</p>
            <span>Add miniatures from the Pile of Shame to see them here</span>
          </div>
        } @else {
          <div class="miniatures-grid">
            @for (miniature of filteredMiniatures(); track miniature.id) {
              <app-mini-card
                [miniature]="miniature"
                (cardClick)="onMiniatureClick(miniature)"
              />
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .library-container {
      padding: var(--space-lg);
      max-width: 1400px;
      margin: 0 auto;
    }

    .library-header {
      margin-bottom: var(--space-xl);

      h1 {
        font-family: var(--font-display);
        font-size: 2rem;
        color: var(--gold);
        margin: 0 0 var(--space-xs) 0;
      }

      .subtitle {
        color: var(--text-secondary);
        margin: 0;
      }
    }

    .filters {
      display: flex;
      gap: var(--space-md);
      margin-bottom: var(--space-lg);
      flex-wrap: wrap;

      .search-input {
        flex: 1;
        min-width: 200px;

        input {
          width: 100%;
        }
      }

      .game-system-filter {
        min-width: 200px;
      }
    }

    .miniatures-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: var(--space-md);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-xxl);
      color: var(--text-secondary);
      text-align: center;

      i {
        font-size: 3rem;
        margin-bottom: var(--space-md);
        color: var(--text-dim);
      }

      p {
        font-size: 1.25rem;
        margin: 0 0 var(--space-xs) 0;
      }

      span {
        color: var(--text-dim);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiniatureLibraryComponent {
  private readonly router = inject(Router);
  private readonly miniatureService = inject(MiniatureService);

  readonly loading = this.miniatureService.loading;
  readonly miniatures = this.miniatureService.miniatures;

  searchQuery = signal('');
  selectedGameSystem = signal<GameSystem | null>(null);

  readonly gameSystemOptions: GameSystemOption[] = [
    { label: 'All Game Systems', value: null },
    { label: 'Warhammer 40K', value: 'warhammer40k' },
    { label: 'Age of Sigmar', value: 'ageOfSigmar' },
    { label: 'Kill Team', value: 'killTeam' },
    { label: 'Necromunda', value: 'necromunda' },
    { label: 'Horus Heresy', value: 'horusHeresy' },
    { label: 'Other', value: 'other' },
  ];

  readonly filteredMiniatures = computed(() => {
    let result = this.miniatures();
    const query = this.searchQuery().toLowerCase();
    const gameSystem = this.selectedGameSystem();

    if (query) {
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.faction.toLowerCase().includes(query)
      );
    }

    if (gameSystem) {
      result = result.filter((m) => m.gameSystem === gameSystem);
    }

    return result;
  });

  onMiniatureClick(miniature: Miniature): void {
    this.router.navigate(['/library', miniature.id]);
  }
}
