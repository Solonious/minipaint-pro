# Liber Pigmenta Design Tokens

Complete design system for the grimdark Warhammer 40K aesthetic.

## Color Palette

### Core Backgrounds

Dark, layered backgrounds creating depth:

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-void` | `#0a0a0f` | Page background, deepest layer |
| `--bg-panel` | `#12121a` | Sidebars, panels, dialogs |
| `--bg-card` | `#1a1a25` | Cards, list items |
| `--bg-elevated` | `#222230` | Hover states, elevated surfaces |

### Borders

| Token | Hex | Usage |
|-------|-----|-------|
| `--border-dim` | `#2a2a3a` | Default borders |
| `--border-glow` | `#3a3a50` | Hover/focus borders |

### Imperial Gold Accent

The signature gold of the Imperium:

| Token | Hex | Usage |
|-------|-----|-------|
| `--gold` | `#c9a227` | Primary accent, links, important elements |
| `--gold-bright` | `#e6c84a` | Hover states, highlights |

### Miniature Painting Status

Status colors for the hobby pipeline:

| Token | Hex | Status |
|-------|-----|--------|
| `--status-unbuilt` | `#4a4a55` | Still on sprue/unassembled |
| `--status-assembled` | `#6b5b3d` | Built but not primed |
| `--status-primed` | `#3d5a6b` | Primed, ready for paint |
| `--status-wip` | `#6b3d5a` | Work in progress |
| `--status-painted` | `#3d6b4f` | Painting complete |
| `--status-complete` | `#c9a227` | Fully finished (varnished, based) |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--success` | `#5fa67a` | Success states, completed items |
| `--error` | `#d93d5c` | Errors, delete actions |
| `--info` | `#3a7bd5` | Information, links |

### Text Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--text-primary` | `#e8e6e3` | Main body text |
| `--text-secondary` | `#9a9890` | Secondary info, labels |
| `--text-dim` | `#5a584f` | Disabled, placeholder |

## Typography

### Font Families

```scss
--font-display: 'Cinzel', serif;       // Imperial gothic for titles
--font-heading: 'Teko', sans-serif;    // Bold military headers
--font-body: 'Exo 2', sans-serif;      // Tech-forward body text
--font-mono: 'Orbitron', monospace;    // Mechanicum data display
```

**Usage Guidelines:**

- **Cinzel** (`--font-display`): Main page titles, card headers, important labels. Evokes imperial authority.
- **Teko** (`--font-heading`): Section headers, category labels. All uppercase with letter-spacing.
- **Exo 2** (`--font-body`): Body text, descriptions, UI elements. Clean and readable.
- **Orbitron** (`--font-mono`): Points values, statistics, counts. Technical data display.

### Font Sizes

| Token | Size | Usage |
|-------|------|-------|
| `--text-xs` | `0.75rem` | Labels, badges |
| `--text-sm` | `0.875rem` | Secondary text, meta |
| `--text-base` | `1rem` | Body text |
| `--text-lg` | `1.125rem` | Emphasized body |
| `--text-xl` | `1.25rem` | Small headings |
| `--text-2xl` | `1.5rem` | Card titles |
| `--text-3xl` | `1.875rem` | Section headers |
| `--text-4xl` | `2.25rem` | Page titles |

### Line Heights

| Token | Value | Usage |
|-------|-------|-------|
| `--leading-tight` | `1.25` | Headings |
| `--leading-normal` | `1.5` | Body text |
| `--leading-relaxed` | `1.75` | Long-form content |

### Font Weights

| Token | Value |
|-------|-------|
| `--font-light` | `300` |
| `--font-normal` | `400` |
| `--font-medium` | `500` |
| `--font-semibold` | `600` |
| `--font-bold` | `700` |

## Spacing Scale

Based on 4px increments:

| Token | Size | Usage |
|-------|------|-------|
| `--space-xs` | `4px` | Tight gaps, inline spacing |
| `--space-sm` | `8px` | Component internal padding |
| `--space-md` | `16px` | Standard card/panel padding |
| `--space-lg` | `24px` | Section spacing |
| `--space-xl` | `32px` | Major section gaps |
| `--space-2xl` | `48px` | Page-level spacing |

## Border Radius

| Token | Size | Usage |
|-------|------|-------|
| `--radius-sm` | `4px` | Small elements, badges |
| `--radius-md` | `8px` | Buttons, inputs, small cards |
| `--radius-lg` | `12px` | Cards, panels |
| `--radius-xl` | `16px` | Large dialogs, major containers |

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 2px 4px rgba(0, 0, 0, 0.3)` | Subtle elevation |
| `--shadow-md` | `0 4px 8px rgba(0, 0, 0, 0.4)` | Cards, dropdowns |
| `--shadow-lg` | `0 8px 16px rgba(0, 0, 0, 0.5)` | Dialogs, popovers |
| `--shadow-glow` | `0 0 20px rgba(201, 162, 39, 0.2)` | Gold accent glow |

## Transitions

| Token | Value | Usage |
|-------|-------|-------|
| `--transition-fast` | `150ms ease` | Hover states |
| `--transition-base` | `250ms ease` | Standard animations |
| `--transition-slow` | `350ms ease` | Complex transitions |

## Layout Constants

| Token | Value | Usage |
|-------|-------|-------|
| `--sidebar-width` | `260px` | Desktop sidebar |
| `--header-height` | `64px` | Top navigation |
| `--bottom-nav-height` | `64px` | Mobile bottom nav |

## CSS Variables Declaration

Full SCSS file for copy/paste:

```scss
:root {
  // Core backgrounds
  --bg-void: #0a0a0f;
  --bg-panel: #12121a;
  --bg-card: #1a1a25;
  --bg-elevated: #222230;

  // Borders
  --border-dim: #2a2a3a;
  --border-glow: #3a3a50;

  // Accent (Gold Imperial)
  --gold: #c9a227;
  --gold-bright: #e6c84a;

  // Status colors
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

  // Typography
  --font-display: 'Cinzel', serif;
  --font-heading: 'Teko', sans-serif;
  --font-body: 'Exo 2', sans-serif;
  --font-mono: 'Orbitron', monospace;

  // Font sizes
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;

  // Line heights
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;

  // Font weights
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  // Spacing
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  // Border radius
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  // Transitions
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 350ms ease;

  // Shadows
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 20px rgba(201, 162, 39, 0.2);

  // Layout
  --sidebar-width: 260px;
  --header-height: 64px;
  --bottom-nav-height: 64px;
}
```

## Utility Classes

Common utility classes for the design system:

```scss
// Text colors
.text-gold { color: var(--gold); }
.text-secondary { color: var(--text-secondary); }
.text-dim { color: var(--text-dim); }

// Font families
.text-display { font-family: var(--font-display); }
.text-heading {
  font-family: var(--font-heading);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.text-body { font-family: var(--font-body); }
.text-mono {
  font-family: var(--font-mono);
  letter-spacing: 0.1em;
}
```
