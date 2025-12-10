# Liber Pigmenta Angular Skill

Build Angular 20 components for a grimdark Warhammer 40K miniature painting companion app with PrimeNG and imperial aesthetic.

## Trigger

Use this skill when building:
- Angular components for Liber Pigmenta / MiniPaint Pro
- PrimeNG component customization
- UI styling with grimdark/imperial theme
- Hobby tracking interfaces (miniatures, paints, armies, recipes)
- Design system implementation

## Stack

- **Framework**: Angular 20 (standalone components, signals)
- **UI Library**: PrimeNG (latest)
- **Styling**: SCSS with CSS custom properties
- **Monorepo**: Nx
- **Types**: `@minipaint-pro/types`

## Component Standards

### Standalone Component Template

```typescript
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-component-name',
  standalone: true,
  imports: [],
  template: `
    <div class="component-name">
      <!-- Template -->
    </div>
  `,
  styles: `
    .component-name {
      background: var(--bg-card);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-md);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentNameComponent {
  // Use signals for inputs
  data = input.required<DataType>();
  optional = input<string>('default');

  // Use outputs for events
  action = output<void>();

  // Derived state with computed
  derivedValue = computed(() => this.data().someProperty);

  // Methods use function syntax, not arrow
  onAction(event: Event): void {
    event.stopPropagation();
    this.action.emit();
  }
}
```

### Key Angular 20 Patterns

1. **Signals for Inputs**: `input.required<T>()` and `input<T>(default)`
2. **Computed for Derived**: `computed(() => expression)`
3. **Output Events**: `output<T>()`
4. **Control Flow**: Use `@if`, `@for`, `@switch` in templates
5. **Change Detection**: Always use `OnPush`
6. **Methods**: Regular functions, not arrow functions

### PrimeNG in Dialogs

Always use `appendTo="body"` for dropdowns inside dialogs:

```html
<p-select [options]="options" appendTo="body" />
<p-dropdown [options]="options" appendTo="body" />
<p-multiselect [options]="options" appendTo="body" />
```

## Design System Quick Reference

### Colors

```scss
// Backgrounds (dark to light)
--bg-void: #0a0a0f;      // Deepest
--bg-panel: #12121a;     // Panels/sidebars
--bg-card: #1a1a25;      // Cards
--bg-elevated: #222230;  // Elevated surfaces

// Borders
--border-dim: #2a2a3a;   // Default
--border-glow: #3a3a50;  // Hover/focus

// Imperial Gold Accent
--gold: #c9a227;         // Primary accent
--gold-bright: #e6c84a;  // Highlights

// Miniature Status
--status-unbuilt: #4a4a55;
--status-assembled: #6b5b3d;
--status-primed: #3d5a6b;
--status-wip: #6b3d5a;
--status-painted: #3d6b4f;
--status-complete: #c9a227;

// Semantic
--success: #5fa67a;
--error: #d93d5c;
--info: #3a7bd5;

// Text
--text-primary: #e8e6e3;
--text-secondary: #9a9890;
--text-dim: #5a584f;
```

### Typography

```scss
--font-display: 'Cinzel', serif;       // Titles (imperial gothic)
--font-heading: 'Teko', sans-serif;    // Section headers
--font-body: 'Exo 2', sans-serif;      // Body text
--font-mono: 'Orbitron', monospace;    // Numbers/data

// Sizes
--text-xs: 0.75rem;   --text-sm: 0.875rem;
--text-base: 1rem;    --text-lg: 1.125rem;
--text-xl: 1.25rem;   --text-2xl: 1.5rem;
--text-3xl: 1.875rem; --text-4xl: 2.25rem;
```

### Spacing & Radius

```scss
// Spacing: 4px scale
--space-xs: 4px;  --space-sm: 8px;   --space-md: 16px;
--space-lg: 24px; --space-xl: 32px;  --space-2xl: 48px;

// Border radius
--radius-sm: 4px;  --radius-md: 8px;
--radius-lg: 12px; --radius-xl: 16px;

// Shadows
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.5);
--shadow-glow: 0 0 20px rgba(201, 162, 39, 0.2);
```

## Common Component Patterns

### Card with Hover Effect

```scss
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-dim);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);

  &:hover {
    border-color: var(--border-glow);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}
```

### Gold Accent Border on Hover

```scss
.item:hover {
  border-color: var(--gold);
  box-shadow: var(--shadow-glow);
}
```

### Status Color Mapping

```typescript
const STATUS_CONFIG: Record<MiniatureStatus, { label: string; color: string }> = {
  unbuilt: { label: 'Unbuilt', color: 'var(--status-unbuilt)' },
  assembled: { label: 'Assembled', color: 'var(--status-assembled)' },
  primed: { label: 'Primed', color: 'var(--status-primed)' },
  wip: { label: 'WIP', color: 'var(--status-wip)' },
  painted: { label: 'Painted', color: 'var(--status-painted)' },
  complete: { label: 'Complete', color: 'var(--status-complete)' },
};
```

### Color Swatch with Preview

```html
<div class="swatch" [style.background-color]="paint().colorHex">
  <span class="status-indicator">&#10003;</span>
</div>
```

### Progress Ring (SVG)

```html
<svg [attr.viewBox]="'0 0 80 80'">
  <circle class="track" cx="40" cy="40" r="37" stroke-width="6" fill="none" />
  <circle class="progress" cx="40" cy="40" r="37" stroke-width="6"
    [attr.stroke-dasharray]="circumference"
    [attr.stroke-dashoffset]="dashOffset"
    [style.stroke]="'var(--gold)'"
    fill="none" />
</svg>
```

## PrimeNG Overrides

Override PrimeNG for grimdark theme:

```scss
// Button
.p-button {
  font-family: var(--font-body);
  border-radius: var(--radius-md);

  &:focus {
    box-shadow: 0 0 0 2px var(--bg-void), 0 0 0 4px var(--gold);
  }
}

// Card
.p-card {
  background: var(--bg-card);
  border: 1px solid var(--border-dim);
  border-radius: var(--radius-lg);
}

// Dialog
.p-dialog {
  background: var(--bg-panel);
  border: 1px solid var(--border-dim);

  .p-dialog-header {
    background: var(--bg-panel);
    border-bottom: 1px solid var(--border-dim);
  }
}

// Inputs
.p-inputtext {
  background: var(--bg-panel);
  border-color: var(--border-dim);

  &:focus {
    border-color: var(--gold);
    box-shadow: 0 0 0 1px var(--gold);
  }
}
```

## Reference Files

For complete documentation, see:
- `references/design-tokens.md` - Full color/typography system
- `references/primeng-patterns.md` - PrimeNG customization guide
- `references/component-patterns.md` - Reusable component examples

## File Structure

```
apps/web/src/app/
├── core/services/        # Singleton services
├── shared/components/    # Reusable components
├── features/             # Feature modules (lazy loaded)
└── layout/               # Shell, sidebar, nav
```

Generate components with:
```bash
nx g @nx/angular:component name --project=web --standalone
```

## Domain Models

Key types from `@minipaint-pro/types`:
- `Miniature` - Unit with status, points, model count
- `Army` - Collection with target points, progress
- `Paint` - Color with brand, type, hex
- `Recipe` - Painting guide with steps
- `MiniatureStatus` - 'unbuilt' | 'assembled' | 'primed' | 'wip' | 'painted' | 'complete'
