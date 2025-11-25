# App Input Component

A comprehensive, production-ready input component for Angular that integrates with Angular Material and follows the project's design system. This component supports all standard HTML input properties plus advanced features like icons, validation, debouncing, and accessibility.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Basic Usage](#basic-usage)
3. [Properties Reference](#properties-reference)
4. [Events](#events)
5. [Examples](#examples)
6. [Validation](#validation)
7. [Accessibility](#accessibility)
8. [Styling](#styling)
9. [API Methods](#api-methods)

---

## Quick Start

### Import the Component

```typescript
import { AppInputComponent } from './shared/components/app-input/app-input.component';

@Component({
  selector: 'app-my-form',
  standalone: true,
  imports: [AppInputComponent, ReactiveFormsModule],
  // ...
})
export class MyFormComponent {}
```

### Basic Template Usage

```html
<app-input
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  [required]="true"
>
</app-input>
```

---

## Basic Usage

### Simple Text Input

```html
<app-input
  label="Full Name"
  placeholder="John Doe"
  [required]="true"
>
</app-input>
```

### Email Input with Icon

```html
<app-input
  label="Email"
  type="email"
  placeholder="you@example.com"
  [required]="true"
  [iconLeft]="{ name: 'email', type: 'material' }"
  hint="We'll never share your email"
>
</app-input>
```

### Password Input with Toggle

```html
<app-input
  label="Password"
  type="password"
  placeholder="Enter password"
  [required]="true"
  [showPasswordToggle]="true"
  [minlength]="8"
>
</app-input>
```

### Search Input with Clear Button

```html
<app-input
  type="search"
  placeholder="Search..."
  [clearable]="true"
  [iconLeft]="{ name: 'search', type: 'material' }"
  (valueChange)="onSearch($event)"
>
</app-input>
```

### With Reactive Forms

```typescript
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export class MyComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    });
  }
}
```

```html
<form [formGroup]="form">
  <app-input
    label="Email"
    formControlName="email"
    type="email"
    [required]="true"
  >
  </app-input>

  <app-input
    label="Phone"
    formControlName="phone"
    type="tel"
    [required]="true"
    hint="Enter 10-digit phone number"
  >
  </app-input>
</form>
```

---

## Properties Reference

### Basic Identification

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `type` | `InputType` | `'text'` | Input type (text, email, password, number, search, tel, url, date, etc.) |
| `id` | `string` | auto-generated | Unique identifier for the input |
| `name` | `string` | `''` | Name attribute for form submission |
| `label` | `string` | `''` | Label text displayed above input |
| `placeholder` | `string` | `''` | Placeholder text shown when empty |

### Styling & Variants

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `variant` | `'fill' \| 'outline' \| 'standard'` | `'outline'` | Material form field appearance |
| `class` | `string` | `''` | Additional CSS classes |
| `dataTheme` | `string` | `''` | Theme variant (e.g., 'dark') |
| `width` | `string` | `undefined` | Custom width (e.g., '300px', '100%') |
| `height` | `string` | `undefined` | Custom height for input element |
| `floatLabel` | `'auto' \| 'always' \| 'never'` | `'auto'` | Label floating behavior |

### User Experience & Behavior

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `autocomplete` | `string` | `'off'` | Browser autocomplete behavior |
| `autofocus` | `boolean` | `false` | Auto-focus on page load |
| `readonly` | `boolean` | `false` | Make input read-only |
| `disabled` | `boolean` | `false` | Disable input |
| `spellcheck` | `boolean` | `false` | Enable spell checking |
| `loading` | `boolean` | `false` | Show loading spinner |

### Validation & Constraints

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `required` | `boolean` | `false` | Mark field as required |
| `minlength` | `number` | `undefined` | Minimum character length |
| `maxlength` | `number` | `undefined` | Maximum character length |
| `pattern` | `string` | `undefined` | Regular expression pattern |
| `min` | `number \| string` | `undefined` | Minimum value (for number/date inputs) |
| `max` | `number \| string` | `undefined` | Maximum value (for number/date inputs) |
| `step` | `number \| string` | `undefined` | Step increment for number inputs |

### Custom Validation

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `customValidation` | `boolean` | `false` | Enable custom validation |
| `validationType` | `string` | `''` | Type of custom validation |
| `validationMessages` | `Record<string, string>` | `{}` | Custom validation error messages |
| `errorMessage` | `string` | `''` | Override error message |
| `successMessage` | `string` | `''` | Success message when valid |
| `hint` | `string` | `''` | Helper text below input |

### Accessibility

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `ariaLabel` | `string` | `''` | ARIA label for screen readers |
| `ariaDescribedBy` | `string` | `''` | ID of element describing the input |
| `ariaLabelledBy` | `string` | `''` | ID of element labeling the input |
| `ariaInvalid` | `boolean` | `false` | Mark input as invalid for screen readers |
| `ariaRequired` | `boolean` | `false` | Mark input as required for screen readers |

### Icons

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `iconLeft` | `IconConfig` | `undefined` | Left icon configuration |
| `iconRight` | `IconConfig` | `undefined` | Right icon configuration |
| `clearable` | `boolean` | `false` | Show clear button when has value |
| `showPasswordToggle` | `boolean` | `false` | Show password visibility toggle (password type only) |

**IconConfig Interface:**
```typescript
interface IconConfig {
  name: string;           // Icon name (Material Icons)
  type?: 'material' | 'fontawesome' | 'custom';
  color?: string;         // Icon color (CSS color value)
  clickable?: boolean;    // Make icon clickable
  tooltip?: string;       // Tooltip text on hover
}
```

### Mobile & Keyboard

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `inputmode` | `InputMode` | `undefined` | Virtual keyboard type on mobile |
| `enterkeyhint` | `EnterKeyHint` | `undefined` | Enter key label on mobile |
| `autocapitalize` | `AutoCapitalize` | `'off'` | Auto-capitalization on mobile |
| `autocorrect` | `boolean` | `false` | Enable autocorrect on mobile |
| `dir` | `'ltr' \| 'rtl' \| 'auto'` | `'ltr'` | Text direction |

### Advanced Behavior

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `debounceTime` | `number` | `0` | Debounce time in ms for value changes |
| `trim` | `boolean` | `false` | Auto-trim whitespace |
| `uppercase` | `boolean` | `false` | Convert to uppercase |
| `lowercase` | `boolean` | `false` | Convert to lowercase |
| `defaultValue` | `string` | `''` | Default value on initialization |
| `locale` | `string` | `''` | Locale for formatting |

### Display Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `size` | `number` | `undefined` | Visible width in characters |
| `showCounter` | `boolean` | `false` | Show character counter (requires maxlength) |

---

## Events

| Event | Type | Description |
|-------|------|-------------|
| `valueChange` | `EventEmitter<string>` | Emits when value changes |
| `inputEvent` | `EventEmitter<Event>` | Native input event |
| `changeEvent` | `EventEmitter<Event>` | Native change event |
| `focusEvent` | `EventEmitter<FocusEvent>` | When input gains focus |
| `blurEvent` | `EventEmitter<FocusEvent>` | When input loses focus |
| `keydownEvent` | `EventEmitter<KeyboardEvent>` | On key down |
| `keyupEvent` | `EventEmitter<KeyboardEvent>` | On key up |
| `clickEvent` | `EventEmitter<MouseEvent>` | On input click |
| `leftIconClick` | `EventEmitter<MouseEvent>` | When left icon clicked (if clickable) |
| `rightIconClick` | `EventEmitter<MouseEvent>` | When right icon clicked (if clickable) |
| `clearClick` | `EventEmitter<void>` | When clear button clicked |

### Event Usage Examples

```html
<app-input
  label="Search"
  (valueChange)="onSearchChange($event)"
  (focusEvent)="onFocus($event)"
  (blurEvent)="onBlur($event)"
  (keyupEvent)="onKeyUp($event)"
>
</app-input>
```

```typescript
export class MyComponent {
  onSearchChange(value: string) {
    console.log('Search value:', value);
  }

  onFocus(event: FocusEvent) {
    console.log('Input focused');
  }

  onBlur(event: FocusEvent) {
    console.log('Input blurred');
  }

  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      console.log('Enter pressed');
    }
  }
}
```

---

## Examples

### Email Input with Validation

```html
<app-input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  [required]="true"
  [iconLeft]="{ name: 'email', type: 'material', color: '#3b82f6' }"
  hint="Enter a valid email address"
  successMessage="Email looks good!"
  (valueChange)="onEmailChange($event)"
>
</app-input>
```

### Search with Debounce

```html
<app-input
  type="search"
  placeholder="Search users..."
  [clearable]="true"
  [debounceTime]="500"
  [iconLeft]="{ name: 'search', type: 'material' }"
  (valueChange)="onSearch($event)"
>
</app-input>
```

```typescript
onSearch(query: string) {
  // This will only fire 500ms after user stops typing
  this.userService.search(query).subscribe(results => {
    this.searchResults = results;
  });
}
```

### Phone Number Input

```html
<app-input
  label="Phone Number"
  type="tel"
  placeholder="(555) 123-4567"
  [required]="true"
  [pattern]="'^[0-9]{10}$'"
  inputmode="numeric"
  [iconLeft]="{ name: 'phone', type: 'material' }"
  hint="10-digit phone number"
  [maxlength]="10"
  [showCounter]="true"
>
</app-input>
```

### Amount Input with Currency

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
  hint="Enter budget amount"
>
</app-input>
```

### Password with Strength Indicator

```html
<app-input
  label="Password"
  type="password"
  placeholder="Create a strong password"
  [required]="true"
  [minlength]="8"
  [maxlength]="50"
  [showPasswordToggle]="true"
  [showCounter]="true"
  hint="At least 8 characters"
  (valueChange)="checkPasswordStrength($event)"
>
</app-input>
```

### Date Input

```html
<app-input
  label="Start Date"
  type="date"
  [required]="true"
  [min]="todayDate"
  [iconLeft]="{ name: 'calendar_today', type: 'material' }"
>
</app-input>
```

### Textarea-like Multi-line (Using Standard Input)

```html
<app-input
  label="Comments"
  placeholder="Enter your comments..."
  [maxlength]="500"
  [showCounter]="true"
  height="120px"
  variant="fill"
>
</app-input>
```

### Clickable Icon Actions

```html
<app-input
  label="Location"
  placeholder="Enter location"
  [iconRight]="{
    name: 'my_location',
    type: 'material',
    clickable: true,
    tooltip: 'Use my current location'
  }"
  (rightIconClick)="getCurrentLocation()"
>
</app-input>
```

### Read-Only Display

```html
<app-input
  label="User ID"
  [value]="userId"
  [readonly]="true"
  variant="fill"
  [iconLeft]="{ name: 'badge', type: 'material' }"
>
</app-input>
```

### Loading State

```html
<app-input
  label="Username"
  placeholder="Enter username"
  [loading]="isCheckingAvailability"
  [debounceTime]="300"
  (valueChange)="checkUsernameAvailability($event)"
>
</app-input>
```

### With Custom Styling

```html
<app-input
  label="Company Name"
  class="custom-input-class"
  width="400px"
  variant="outline"
  dataTheme="dark"
>
</app-input>
```

---

## Validation

### Built-in Validation

The component automatically handles Angular's built-in validators:

```typescript
this.form = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  age: ['', [Validators.required, Validators.min(18), Validators.max(100)]],
  username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]]
});
```

### Custom Validation Messages

```html
<app-input
  label="Email"
  formControlName="email"
  [validationMessages]="{
    required: 'Email is required',
    email: 'Please enter a valid email address'
  }"
>
</app-input>
```

### Programmatic Error Setting

```typescript
@ViewChild(AppInputComponent) inputComponent!: AppInputComponent;

validateCustom() {
  if (this.inputComponent.getValue() === 'invalid') {
    this.inputComponent.setError('This value is not allowed');
  } else {
    this.inputComponent.clearError();
  }
}
```

---

## Accessibility

The component is built with accessibility in mind:

- ✅ Full keyboard navigation support
- ✅ Screen reader compatible (ARIA labels)
- ✅ High contrast focus indicators
- ✅ Proper form field associations
- ✅ Error announcements
- ✅ Disabled state handling

### Accessibility Best Practices

```html
<!-- Always provide labels -->
<app-input
  label="Full Name"
  ariaLabel="Enter your full name"
  [required]="true"
>
</app-input>

<!-- Provide helpful hints -->
<app-input
  label="Password"
  type="password"
  hint="Must be at least 8 characters"
  ariaDescribedBy="password-hint"
>
</app-input>

<!-- Use appropriate input types -->
<app-input
  label="Phone"
  type="tel"
  inputmode="numeric"
>
</app-input>
```

---

## Styling

The component fully respects your design system variables from [_variables.scss](../../../../styles/_variables.scss).

### Custom Styling

```scss
// In your component styles
::ng-deep {
  .custom-input-class {
    .mat-mdc-form-field {
      // Custom styles here
    }
  }
}
```

### Theming

```html
<!-- Light theme (default) -->
<app-input label="Name" dataTheme="light"></app-input>

<!-- Dark theme -->
<app-input label="Name" dataTheme="dark"></app-input>
```

---

## API Methods

Access component methods using `@ViewChild`:

```typescript
@ViewChild(AppInputComponent) inputComponent!: AppInputComponent;

ngAfterViewInit() {
  // Focus the input
  this.inputComponent.focus();

  // Get current value
  const value = this.inputComponent.getValue();

  // Set value programmatically
  this.inputComponent.setValue('new value');

  // Reset to default
  this.inputComponent.reset();

  // Get current state
  const state = this.inputComponent.getState(); // 'empty' | 'valid' | 'invalid' | 'focused'

  // Set custom error
  this.inputComponent.setError('Custom error message');

  // Clear error
  this.inputComponent.clearError();

  // Blur the input
  this.inputComponent.blur();
}
```

---

## Advanced Patterns

### Form Array with Dynamic Inputs

```typescript
export class MyComponent {
  form = this.fb.group({
    emails: this.fb.array([])
  });

  get emails() {
    return this.form.get('emails') as FormArray;
  }

  addEmail() {
    this.emails.push(this.fb.control('', [Validators.required, Validators.email]));
  }
}
```

```html
<div formArrayName="emails">
  <div *ngFor="let email of emails.controls; let i = index">
    <app-input
      [formControlName]="i"
      label="Email {{ i + 1 }}"
      type="email"
      [clearable]="true"
    >
    </app-input>
  </div>
</div>
<button (click)="addEmail()">Add Email</button>
```

### Conditional Validation

```html
<app-input
  label="Referral Code"
  [required]="isReferralRequired"
  [disabled]="!hasReferral"
  [hint]="hasReferral ? 'Enter your referral code' : 'Referrals not available'"
>
</app-input>
```

---

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## Performance Tips

1. **Use debounceTime for search inputs** to reduce API calls
2. **Enable trim** for text inputs to avoid unnecessary whitespace
3. **Use inputmode** for better mobile keyboard experience
4. **Implement virtual scrolling** for forms with many inputs

---

## Troubleshooting

### Issue: Icons not showing
**Solution:** Ensure Material Icons are loaded in [index.html](../../../index.html)

### Issue: Styles not applying
**Solution:** Check that design system styles are imported in [styles.scss](../../../../styles.scss)

### Issue: Form validation not working
**Solution:** Ensure ReactiveFormsModule is imported in your component

---

## License

This component is part of the Project Cost Management Application.
