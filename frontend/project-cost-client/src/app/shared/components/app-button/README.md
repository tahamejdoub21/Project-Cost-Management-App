# App Button Component

A comprehensive, accessible button component with multiple variants, sizes, and states.

## Features

- ✅ 5 Size variants (xs, sm, md, lg, xl)
- ✅ 5 Hierarchy types (primary, secondary, tertiary, ghost, link)
- ✅ Destructive variant for all hierarchies
- ✅ Icon support (left, right, icon-only)
- ✅ Loading state with spinner
- ✅ Disabled state
- ✅ Full width option
- ✅ Accessible (keyboard navigation, ARIA)
- ✅ Material Icons integration

## Usage

### Basic Usage

```typescript
import { AppButtonComponent } from '@/shared/components/app-button';

@Component({
  selector: 'my-component',
  standalone: true,
  imports: [AppButtonComponent],
  template: `
    <app-button (clicked)="handleClick()">
      Click Me
    </app-button>
  `
})
```

### Size Variants

```html
<!-- Extra Small -->
<app-button size="xs">Extra Small</app-button>

<!-- Small -->
<app-button size="sm">Small</app-button>

<!-- Medium (Default) -->
<app-button size="md">Medium</app-button>

<!-- Large -->
<app-button size="lg">Large</app-button>

<!-- Extra Large -->
<app-button size="xl">Extra Large</app-button>
```

### Hierarchy Variants

```html
<!-- Primary (Default) -->
<app-button hierarchy="primary">Primary</app-button>

<!-- Secondary -->
<app-button hierarchy="secondary">Secondary</app-button>

<!-- Tertiary -->
<app-button hierarchy="tertiary">Tertiary</app-button>

<!-- Ghost -->
<app-button hierarchy="ghost">Ghost</app-button>

<!-- Link -->
<app-button hierarchy="link">Link</app-button>
```

### Destructive Variant

```html
<!-- Primary Destructive -->
<app-button [destructive]="true">Delete</app-button>

<!-- Secondary Destructive -->
<app-button hierarchy="secondary" [destructive]="true">Remove</app-button>

<!-- Tertiary Destructive -->
<app-button hierarchy="tertiary" [destructive]="true">Cancel</app-button>
```

### With Icons

```html
<!-- Icon Left (Default) -->
<app-button icon="language" iconPosition="left">
  Language
</app-button>

<!-- Icon Right -->
<app-button icon="arrow_forward" iconPosition="right">
  Next
</app-button>

<!-- Icon Only -->
<app-button icon="settings" iconPosition="only"></app-button>
```

### States

```html
<!-- Disabled -->
<app-button [disabled]="true">Disabled</app-button>

<!-- Loading -->
<app-button [loading]="isLoading">
  Submit
</app-button>

<!-- Full Width -->
<app-button [fullWidth]="true">Full Width Button</app-button>
```

### Form Buttons

```html
<!-- Submit Button -->
<app-button type="submit">Submit</app-button>

<!-- Reset Button -->
<app-button type="reset" hierarchy="secondary">Reset</app-button>
```

### Complete Example

```html
<form (submit)="onSubmit()">
  <app-button
    type="submit"
    size="lg"
    hierarchy="primary"
    icon="save"
    iconPosition="left"
    [loading]="isSubmitting"
    [fullWidth]="true"
  >
    Save Changes
  </app-button>

  <app-button
    type="button"
    size="lg"
    hierarchy="ghost"
    [disabled]="isSubmitting"
    (clicked)="onCancel()"
  >
    Cancel
  </app-button>
</form>
```

## API

### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Button size |
| `hierarchy` | `'primary' \| 'secondary' \| 'tertiary' \| 'ghost' \| 'link'` | `'primary'` | Visual hierarchy |
| `disabled` | `boolean` | `false` | Disabled state |
| `loading` | `boolean` | `false` | Loading state |
| `destructive` | `boolean` | `false` | Destructive variant (red) |
| `icon` | `string` | `undefined` | Material Icon name |
| `iconPosition` | `'left' \| 'right' \| 'only'` | `'left'` | Icon position |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Button type |
| `fullWidth` | `boolean` | `false` | Full width button |

### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `clicked` | `EventEmitter<MouseEvent>` | Emitted when button is clicked |

## Accessibility

- Proper ARIA attributes
- Keyboard navigation support
- Focus indicators
- Disabled state handling
- Screen reader friendly

## Design Tokens Used

- Colors: Primary palette (600, 700, 800), Error palette (600, 700, 800), Neutral palette
- Spacing: spacing-2 through spacing-7
- Border radius: radius-md, radius-lg
- Shadows: shadow-sm
- Font: font-family-primary, font-weight-medium
- Font sizes: font-size-xs through font-size-lg
