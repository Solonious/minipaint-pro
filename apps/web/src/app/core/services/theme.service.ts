import {
  Injectable,
  PLATFORM_ID,
  RendererFactory2,
  inject,
  signal,
  Renderer2,
} from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { StorageService } from './storage.service';

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'minipaint-theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly storageService = inject(StorageService);
  private readonly rendererFactory = inject(RendererFactory2);
  private readonly renderer: Renderer2;
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly theme = signal<Theme>('dark');

  constructor() {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.initTheme();
  }

  private initTheme(): void {
    if (!this.isBrowser) {
      return;
    }

    const savedTheme = this.storageService.get<Theme>(THEME_STORAGE_KEY);
    const initialTheme: Theme = savedTheme || 'dark';

    this.theme.set(initialTheme);
    this.applyTheme(initialTheme);
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
    this.storageService.set(THEME_STORAGE_KEY, theme);
    this.applyTheme(theme);
  }

  toggleTheme(): void {
    const newTheme: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  private applyTheme(theme: Theme): void {
    if (!this.isBrowser) {
      return;
    }

    const htmlElement = this.document.documentElement;

    if (theme === 'dark') {
      this.renderer.addClass(htmlElement, 'dark-mode');
    } else {
      this.renderer.removeClass(htmlElement, 'dark-mode');
    }
  }
}
