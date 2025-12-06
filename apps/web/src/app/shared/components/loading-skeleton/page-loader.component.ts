import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-page-loader',
  standalone: true,
  imports: [ProgressSpinnerModule],
  template: `
    <div class="page-loader">
      <p-progressSpinner
        [style]="{ width: '48px', height: '48px' }"
        strokeWidth="3"
        animationDuration=".8s"
      />
      @if (message()) {
        <span class="loader-message">{{ message() }}</span>
      }
    </div>
  `,
  styles: `
    .page-loader {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-md);
      padding: var(--space-xxl) var(--space-lg);
      min-height: 200px;
    }

    .loader-message {
      font-family: var(--font-body);
      font-size: 0.875rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    :host ::ng-deep .p-progress-spinner-circle {
      stroke: var(--gold);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageLoaderComponent {
  message = input<string>('');
}
