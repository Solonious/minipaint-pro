import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [],
  template: `
    <div class="app-loader">
      <div class="loader-content">
        <div class="logo-container">
          <img
            class="logo"
            src="assets/icons/logo.svg"
            alt="Liber Pigmentum"
          />
          <div class="logo-glow"></div>
        </div>
        <h1 class="app-name">Liber Pigmentum</h1>
        <div class="loading-bar">
          <div class="loading-bar-progress"></div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .app-loader {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-void);
      z-index: 9999;
    }

    .loader-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-lg);
    }

    .logo-container {
      position: relative;
      width: 120px;
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo {
      width: 100px;
      height: 100px;
      object-fit: contain;
      animation: logo-pulse 2s ease-in-out infinite;
      position: relative;
      z-index: 1;
    }

    .logo-glow {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: radial-gradient(
        circle,
        rgba(201, 162, 39, 0.3) 0%,
        rgba(201, 162, 39, 0) 70%
      );
      animation: glow-pulse 2s ease-in-out infinite;
    }

    @keyframes logo-pulse {
      0%,
      100% {
        transform: scale(1);
        filter: drop-shadow(0 0 8px rgba(201, 162, 39, 0.4));
      }
      50% {
        transform: scale(1.05);
        filter: drop-shadow(0 0 20px rgba(201, 162, 39, 0.6));
      }
    }

    @keyframes glow-pulse {
      0%,
      100% {
        transform: scale(1);
        opacity: 0.5;
      }
      50% {
        transform: scale(1.3);
        opacity: 1;
      }
    }

    .app-name {
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .loading-bar {
      width: 200px;
      height: 3px;
      background: var(--bg-elevated);
      border-radius: var(--radius-sm);
      overflow: hidden;
    }

    .loading-bar-progress {
      height: 100%;
      width: 40%;
      background: linear-gradient(90deg, var(--gold), var(--gold-bright));
      border-radius: var(--radius-sm);
      animation: loading-slide 1.2s ease-in-out infinite;
    }

    @keyframes loading-slide {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(350%);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLoaderComponent {}
