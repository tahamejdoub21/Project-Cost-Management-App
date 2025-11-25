# App Input - Quick Reference Guide

## Import

```typescript
import { AppInputComponent } from './shared/components/app-input';
```

## Basic Examples

### 1. Simple Text Input
```html
<app-input label="Name" placeholder="Enter name"></app-input>
```

### 2. Email with Icon
```html
<app-input
  label="Email"
  type="email"
  [required]="true"
  [iconLeft]="{ name: 'email', type: 'material' }"
>
</app-input>
```

### 3. Password with Toggle
```html
<app-input
  label="Password"
  type="password"
  [showPasswordToggle]="true"
  [required]="true"
>
</app-input>
```

### 4. Search with Clear
```html
<app-input
  type="search"
  placeholder="Search..."
  [clearable]="true"
  [iconLeft]="{ name: 'search', type: 'material' }"
>
</app-input>
```

### 5. Number Input
```html
<app-input
  label="Budget"
  type="number"
  [min]="0"
  [step]="0.01"
  inputmode="decimal"
>
</app-input>
```

### 6. Date Picker
```html
<app-input
  label="Start Date"
  type="date"
  [required]="true"
>
</app-input>
```

### 7. With Validation
```html
<app-input
  label="Phone"
  type="tel"
  [pattern]="'^[0-9]{10}$'"
  [maxlength]="10"
  [showCounter]="true"
  hint="10-digit phone number"
>
</app-input>
```

### 8. With Debounce
```html
<app-input
  type="search"
  [debounceTime]="500"
  (valueChange)="onSearch($event)"
>
</app-input>
```

### 9. With Loading State
```html
<app-input
  label="Username"
  [loading]="isChecking"
  [debounceTime]="300"
  (valueChange)="checkAvailability($event)"
>
</app-input>
```

### 10. Reactive Forms
```typescript
// Component
form = this.fb.group({
  email: ['', [Validators.required, Validators.email]]
});
```

```html
<!-- Template -->
<form [formGroup]="form">
  <app-input
    label="Email"
    formControlName="email"
    type="email"
  >
  </app-input>
</form>
```

## Common Icon Names (Material Icons)

- `email` - Email
- `person` - User/Person
- `lock` - Lock/Security
- `search` - Search
- `phone` - Phone
- `location_on` - Location
- `calendar_today` - Calendar
- `attach_money` - Money/Currency
- `folder` - Folder
- `task` - Task
- `schedule` - Time/Clock
- `visibility` / `visibility_off` - Show/Hide
- `check_circle` - Success
- `error` - Error
- `info` - Information
- `warning` - Warning
- `close` - Close/Clear
- `my_location` - GPS/Current Location
- `date_range` - Date Range
- `event` - Event/Date
- `tag` - Tag/Label

## Common Properties Cheatsheet

| Property | Type | Use Case |
|----------|------|----------|
| `label` | string | Field label |
| `placeholder` | string | Hint text |
| `type` | InputType | Input type (text, email, password, etc.) |
| `required` | boolean | Mark as required |
| `disabled` | boolean | Disable input |
| `readonly` | boolean | Make read-only |
| `clearable` | boolean | Show clear button |
| `loading` | boolean | Show loading spinner |
| `variant` | 'fill' \| 'outline' | Material appearance |
| `iconLeft` | IconConfig | Left icon |
| `iconRight` | IconConfig | Right icon |
| `hint` | string | Helper text below input |
| `errorMessage` | string | Custom error message |
| `successMessage` | string | Success message when valid |
| `minlength` | number | Min character length |
| `maxlength` | number | Max character length |
| `showCounter` | boolean | Show character counter |
| `pattern` | string | Regex pattern |
| `min` | number | Min value (number/date) |
| `max` | number | Max value (number/date) |
| `step` | number | Step increment |
| `debounceTime` | number | Debounce in ms |
| `trim` | boolean | Auto-trim whitespace |
| `uppercase` | boolean | Convert to uppercase |
| `lowercase` | boolean | Convert to lowercase |
| `inputmode` | InputMode | Mobile keyboard type |
| `autocomplete` | string | Browser autocomplete |

## Common Events

| Event | When Fired |
|-------|------------|
| `(valueChange)` | When value changes |
| `(focusEvent)` | Input gains focus |
| `(blurEvent)` | Input loses focus |
| `(clearClick)` | Clear button clicked |
| `(leftIconClick)` | Left icon clicked (if clickable) |
| `(rightIconClick)` | Right icon clicked (if clickable) |
| `(keyupEvent)` | Key released |
| `(keydownEvent)` | Key pressed |

## Validation with Reactive Forms

```typescript
// In Component
form = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(8)]],
  age: ['', [Validators.min(18), Validators.max(100)]],
  username: ['', [Validators.pattern(/^[a-zA-Z0-9_]+$/)]]
});
```

## IconConfig Interface

```typescript
interface IconConfig {
  name: string;           // Icon name
  type?: 'material';      // Icon type (default: 'material')
  color?: string;         // CSS color
  clickable?: boolean;    // Make clickable
  tooltip?: string;       // Tooltip text
}
```

## Programmatic Methods

```typescript
@ViewChild(AppInputComponent) input!: AppInputComponent;

// Focus input
this.input.focus();

// Get value
const value = this.input.getValue();

// Set value
this.input.setValue('new value');

// Reset to default
this.input.reset();

// Set error
this.input.setError('Custom error');

// Clear error
this.input.clearError();
```

## Design System Colors

Use these in `iconLeft.color` or `iconRight.color`:

- Primary Blue: `#3b82f6`
- Secondary Purple: `#a855f7`
- Accent Cyan: `#06b6d4`
- Success Green: `#22c55e`
- Warning Amber: `#f59e0b`
- Error Red: `#ef4444`
- Info Blue: `#3b82f6`

## Full Feature Example

```html
<app-input
  label="Project Budget"
  type="number"
  placeholder="0.00"
  [required]="true"
  [min]="0"
  [step]="0.01"
  inputmode="decimal"
  [iconLeft]="{ name: 'attach_money', type: 'material', color: '#22c55e' }"
  [maxlength]="10"
  [showCounter]="true"
  hint="Enter budget in USD"
  variant="outline"
  (valueChange)="onBudgetChange($event)"
  (focusEvent)="onFocus($event)"
>
</app-input>
```

## Accessibility Tips

✅ Always provide a `label`
✅ Use appropriate `type` for inputs
✅ Add `hint` for complex validations
✅ Use `inputmode` for better mobile UX
✅ Set `ariaLabel` when label isn't visible
✅ Use `autocomplete` for common fields

## Common Patterns

### Username Availability Check
```html
<app-input
  label="Username"
  [loading]="checkingUsername"
  [debounceTime]="500"
  (valueChange)="checkUsername($event)"
  successMessage="Username available!"
>
</app-input>
```

### Location with GPS
```html
<app-input
  label="Location"
  [iconRight]="{
    name: 'my_location',
    clickable: true,
    tooltip: 'Use GPS'
  }"
  (rightIconClick)="useGPS()"
>
</app-input>
```

### Auto-uppercase Code
```html
<app-input
  label="Project Code"
  [uppercase]="true"
  [pattern]="'^[A-Z]{3}-[0-9]{3}$'"
  hint="Format: ABC-123"
>
</app-input>
```
