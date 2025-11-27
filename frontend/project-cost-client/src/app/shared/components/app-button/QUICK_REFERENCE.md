# App Button - Quick Reference

## Import

```typescript
import { AppButtonComponent } from '@/shared/components/app-button';
```

## Common Patterns

### Primary Actions
```html
<app-button>Save</app-button>
<app-button icon="add">Create New</app-button>
<app-button [loading]="saving">Saving...</app-button>
```

### Secondary Actions
```html
<app-button hierarchy="secondary">Cancel</app-button>
<app-button hierarchy="secondary" icon="edit">Edit</app-button>
```

### Destructive Actions
```html
<app-button [destructive]="true" icon="delete">Delete</app-button>
<app-button hierarchy="secondary" [destructive]="true">Remove</app-button>
```

### Icon Buttons
```html
<app-button icon="settings" iconPosition="only" size="sm"></app-button>
<app-button icon="more_vert" iconPosition="only" hierarchy="ghost"></app-button>
```

### Navigation
```html
<app-button icon="arrow_back" iconPosition="left">Back</app-button>
<app-button icon="arrow_forward" iconPosition="right">Next</app-button>
```

### Forms
```html
<app-button type="submit" [loading]="isSubmitting">Submit</app-button>
<app-button type="reset" hierarchy="ghost">Reset</app-button>
```

## Size Guide

- `xs` (32px) - Compact UI, toolbars
- `sm` (36px) - Tables, cards
- `md` (40px) - **Default**, most use cases
- `lg` (44px) - Forms, CTAs
- `xl` (48px) - Hero sections, primary CTAs

## Hierarchy Guide

- `primary` - Main actions (Save, Create, Submit)
- `secondary` - Supporting actions (Cancel, Back)
- `tertiary` - Less prominent actions
- `ghost` - Minimal actions (Close, Dismiss)
- `link` - Navigation, inline actions
