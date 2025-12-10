# PrimeNG Patterns for Grimdark Theme

Guide to customizing PrimeNG components for the Liber Pigmenta imperial aesthetic.

## Theme Configuration

### PrimeNG CSS Variable Overrides

Map PrimeNG's design tokens to our color system:

```scss
:root {
  // Primary colors
  --p-primary-color: var(--gold);
  --p-primary-contrast-color: var(--bg-void);
  --p-primary-hover-color: var(--gold-bright);
  --p-primary-active-color: var(--gold);

  // Surface colors (dark to light scale)
  --p-surface-0: var(--bg-void);
  --p-surface-50: var(--bg-panel);
  --p-surface-100: var(--bg-card);
  --p-surface-200: var(--bg-elevated);
  --p-surface-300: var(--border-dim);
  --p-surface-400: var(--border-glow);
  --p-surface-500: var(--text-dim);
  --p-surface-600: var(--text-secondary);
  --p-surface-700: var(--text-primary);
  --p-surface-800: #f0ede8;
  --p-surface-900: #ffffff;

  // Text
  --p-text-color: var(--text-primary);
  --p-text-muted-color: var(--text-secondary);

  // Content/cards
  --p-content-background: var(--bg-card);
  --p-content-border-color: var(--border-dim);
  --p-content-hover-background: var(--bg-elevated);

  // Form fields
  --p-form-field-background: var(--bg-panel);
  --p-form-field-border-color: var(--border-dim);
  --p-form-field-focus-border-color: var(--gold);

  // Overlays
  --p-overlay-background: var(--bg-panel);
  --p-mask-background: rgba(10, 10, 15, 0.8);
}
```

## Component Overrides

### Buttons

```scss
.p-button {
  font-family: var(--font-body);
  font-weight: var(--font-semibold);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);

  &:focus {
    box-shadow: 0 0 0 2px var(--bg-void), 0 0 0 4px var(--gold);
  }
}

// Gold primary button
.p-button.p-button-primary {
  background: var(--gold);
  border-color: var(--gold);
  color: var(--bg-void);

  &:hover {
    background: var(--gold-bright);
    border-color: var(--gold-bright);
  }
}

// Ghost/text button
.p-button.p-button-text {
  color: var(--text-primary);

  &:hover {
    background: var(--bg-elevated);
    color: var(--gold);
  }
}

// Outlined button
.p-button.p-button-outlined {
  border-color: var(--border-glow);
  color: var(--text-primary);

  &:hover {
    border-color: var(--gold);
    color: var(--gold);
    background: rgba(201, 162, 39, 0.1);
  }
}
```

### Cards

```scss
.p-card {
  background: var(--bg-card);
  border: 1px solid var(--border-dim);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);

  .p-card-header {
    padding: var(--space-md);
    border-bottom: 1px solid var(--border-dim);
  }

  .p-card-body {
    padding: var(--space-md);
  }

  .p-card-title {
    font-family: var(--font-display);
    color: var(--text-primary);
  }
}
```

### Dialogs

**Important**: Always use `appendTo="body"` for dropdowns inside dialogs.

```scss
.p-dialog {
  background: var(--bg-panel);
  border: 1px solid var(--border-dim);
  border-radius: var(--radius-lg);

  .p-dialog-header {
    background: var(--bg-panel);
    border-bottom: 1px solid var(--border-dim);
    color: var(--text-primary);
    padding: var(--space-md);

    .p-dialog-title {
      font-family: var(--font-display);
      font-weight: var(--font-semibold);
    }
  }

  .p-dialog-content {
    background: var(--bg-panel);
    padding: var(--space-md);
  }

  .p-dialog-footer {
    background: var(--bg-panel);
    border-top: 1px solid var(--border-dim);
    padding: var(--space-md);
  }
}

// Dialog mask (backdrop)
.p-dialog-mask {
  background: var(--p-mask-background);
  backdrop-filter: blur(4px);
}
```

### Form Inputs

```scss
.p-inputtext {
  background: var(--bg-panel);
  border-color: var(--border-dim);
  color: var(--text-primary);
  border-radius: var(--radius-md);
  font-family: var(--font-body);

  &:focus {
    border-color: var(--gold);
    box-shadow: 0 0 0 1px var(--gold);
  }

  &::placeholder {
    color: var(--text-dim);
  }

  &:disabled {
    background: var(--bg-void);
    opacity: 0.5;
  }
}

// Textarea
.p-textarea {
  @extend .p-inputtext;
  min-height: 100px;
}

// Number input
.p-inputnumber-input {
  font-family: var(--font-mono);
}
```

### Select/Dropdown

```html
<!-- Always use appendTo="body" in dialogs -->
<p-select
  [options]="options"
  [(ngModel)]="selected"
  appendTo="body"
  placeholder="Select..."
/>
```

```scss
.p-dropdown,
.p-select {
  background: var(--bg-panel);
  border-color: var(--border-dim);
  border-radius: var(--radius-md);

  &:hover {
    border-color: var(--border-glow);
  }

  &.p-focus {
    border-color: var(--gold);
    box-shadow: 0 0 0 1px var(--gold);
  }

  .p-dropdown-label {
    color: var(--text-primary);
  }

  .p-dropdown-trigger {
    color: var(--text-secondary);
  }
}

// Dropdown panel
.p-dropdown-panel {
  background: var(--bg-panel);
  border: 1px solid var(--border-glow);
  border-radius: var(--radius-md);

  .p-dropdown-item {
    color: var(--text-primary);

    &:hover {
      background: var(--bg-elevated);
    }

    &.p-highlight {
      background: rgba(201, 162, 39, 0.15);
      color: var(--gold);
    }
  }
}
```

### Multi-Select

```html
<p-multiselect
  [options]="options"
  [(ngModel)]="selected"
  appendTo="body"
  display="chip"
  placeholder="Select items..."
/>
```

### Data Table

```scss
.p-datatable {
  .p-datatable-header {
    background: var(--bg-panel);
    border-bottom: 1px solid var(--border-dim);
    padding: var(--space-md);
  }

  .p-datatable-thead > tr > th {
    background: var(--bg-card);
    color: var(--text-secondary);
    font-family: var(--font-heading);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: var(--text-xs);
    border-color: var(--border-dim);
  }

  .p-datatable-tbody > tr {
    background: var(--bg-panel);

    &:hover {
      background: var(--bg-card);
    }

    > td {
      border-color: var(--border-dim);
      color: var(--text-primary);
    }
  }

  // Striped rows
  &.p-datatable-striped .p-datatable-tbody > tr:nth-child(even) {
    background: var(--bg-card);
  }

  // Row selection
  .p-datatable-tbody > tr.p-highlight {
    background: rgba(201, 162, 39, 0.1);
    color: var(--text-primary);
  }
}
```

### Progress Bar

```scss
.p-progressbar {
  background: var(--bg-elevated);
  border-radius: var(--radius-sm);
  height: 8px;

  .p-progressbar-value {
    background: linear-gradient(90deg, var(--gold), var(--gold-bright));
    border-radius: var(--radius-sm);
  }

  .p-progressbar-label {
    color: var(--bg-void);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
  }
}
```

### Badges and Tags

```scss
.p-badge {
  font-family: var(--font-mono);
  font-weight: var(--font-medium);
  border-radius: var(--radius-sm);

  &.p-badge-success {
    background: var(--success);
  }

  &.p-badge-warning {
    background: var(--gold);
    color: var(--bg-void);
  }

  &.p-badge-danger {
    background: var(--error);
  }

  &.p-badge-info {
    background: var(--info);
  }
}

.p-tag {
  font-family: var(--font-body);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: var(--text-xs);
}
```

### Menus and Navigation

```scss
.p-menu {
  background: var(--bg-panel);
  border-color: var(--border-dim);
  border-radius: var(--radius-md);

  .p-menuitem-link {
    color: var(--text-primary);
    transition: all var(--transition-fast);
    padding: var(--space-sm) var(--space-md);

    &:hover {
      background: var(--bg-elevated);
    }

    .p-menuitem-icon {
      color: var(--text-secondary);
    }
  }

  .p-menuitem-link.p-highlight,
  .p-menuitem.p-highlight > .p-menuitem-link {
    background: rgba(201, 162, 39, 0.15);
    color: var(--gold);

    .p-menuitem-icon {
      color: var(--gold);
    }
  }
}

// Sidebar menu
.p-panelmenu {
  .p-panelmenu-header {
    background: var(--bg-card);
    border-color: var(--border-dim);
    color: var(--text-primary);
    font-family: var(--font-heading);
    text-transform: uppercase;

    &:hover {
      background: var(--bg-elevated);
    }
  }

  .p-panelmenu-content {
    background: var(--bg-panel);
    border-color: var(--border-dim);
  }
}
```

### Tooltips

```scss
.p-tooltip {
  max-width: 300px !important;

  .p-tooltip-text {
    background: var(--bg-elevated);
    color: var(--text-primary);
    border: 1px solid var(--border-glow);
    border-radius: var(--radius-md);
    font-family: var(--font-body);
    font-size: var(--text-sm);
    padding: var(--space-sm) var(--space-md);
  }

  // Arrow styling
  .p-tooltip-arrow {
    border-color: var(--bg-elevated);
  }
}
```

### Toast/Messages

```scss
.p-toast {
  .p-toast-message {
    background: var(--bg-card);
    border: 1px solid var(--border-dim);
    border-radius: var(--radius-md);

    &.p-toast-message-success {
      border-left: 4px solid var(--success);
    }

    &.p-toast-message-error {
      border-left: 4px solid var(--error);
    }

    &.p-toast-message-warn {
      border-left: 4px solid var(--gold);
    }

    &.p-toast-message-info {
      border-left: 4px solid var(--info);
    }
  }

  .p-toast-message-content {
    color: var(--text-primary);
  }

  .p-toast-summary {
    font-family: var(--font-heading);
    text-transform: uppercase;
  }

  .p-toast-detail {
    font-family: var(--font-body);
    color: var(--text-secondary);
  }
}
```

### Tabs

```scss
.p-tabview {
  .p-tabview-nav {
    background: var(--bg-panel);
    border-bottom: 1px solid var(--border-dim);

    li {
      .p-tabview-nav-link {
        background: transparent;
        border-color: transparent;
        color: var(--text-secondary);
        font-family: var(--font-heading);
        text-transform: uppercase;
        letter-spacing: 0.05em;

        &:hover {
          color: var(--text-primary);
          border-color: var(--border-glow);
        }
      }

      &.p-highlight .p-tabview-nav-link {
        color: var(--gold);
        border-color: var(--gold);
      }
    }
  }

  .p-tabview-panels {
    background: var(--bg-panel);
    padding: var(--space-md);
  }
}
```

### Galleria (Image Gallery)

```scss
.p-galleria {
  .p-galleria-item-container {
    background: var(--bg-void);
  }

  .p-galleria-thumbnail-container {
    background: var(--bg-panel);
    padding: var(--space-sm);
  }

  .p-galleria-thumbnail-item {
    opacity: 0.6;
    border: 2px solid transparent;

    &:hover {
      opacity: 0.8;
    }

    &.p-galleria-thumbnail-item-current {
      opacity: 1;
      border-color: var(--gold);
    }
  }
}
```

## Responsive Patterns

### Breakpoints

```scss
$breakpoint-sm: 576px;
$breakpoint-md: 768px;
$breakpoint-lg: 992px;
$breakpoint-xl: 1200px;

@mixin mobile {
  @media (max-width: #{$breakpoint-md - 1}) {
    @content;
  }
}

@mixin tablet {
  @media (min-width: #{$breakpoint-md}) and (max-width: #{$breakpoint-lg - 1}) {
    @content;
  }
}

@mixin desktop {
  @media (min-width: #{$breakpoint-lg}) {
    @content;
  }
}
```

### Mobile-First Component Styling

```scss
// Example: Card grid
.card-grid {
  display: grid;
  gap: var(--space-md);
  grid-template-columns: 1fr; // Mobile: single column

  @include tablet {
    grid-template-columns: repeat(2, 1fr);
  }

  @include desktop {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## Scrollbar Styling

```scss
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-void);
}

::-webkit-scrollbar-thumb {
  background: var(--border-glow);
  border-radius: var(--radius-sm);

  &:hover {
    background: var(--text-dim);
  }
}
```
