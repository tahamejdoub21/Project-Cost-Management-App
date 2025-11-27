/**
 * App Button Component - Usage Examples
 *
 * This file contains common usage patterns for the AppButtonComponent
 */

export const BUTTON_EXAMPLES = {
  // Basic Usage
  basic: `
<app-button>Click Me</app-button>
  `,

  // Size Variants
  sizes: `
<app-button size="xs">Extra Small</app-button>
<app-button size="sm">Small</app-button>
<app-button size="md">Medium</app-button>
<app-button size="lg">Large</app-button>
<app-button size="xl">Extra Large</app-button>
  `,

  // Hierarchy Variants
  hierarchy: `
<app-button hierarchy="primary">Primary</app-button>
<app-button hierarchy="secondary">Secondary</app-button>
<app-button hierarchy="tertiary">Tertiary</app-button>
<app-button hierarchy="ghost">Ghost</app-button>
<app-button hierarchy="link">Link</app-button>
  `,

  // With Icons
  withIcons: `
<!-- Icon Left -->
<app-button icon="save" iconPosition="left">
  Save
</app-button>

<!-- Icon Right -->
<app-button icon="arrow_forward" iconPosition="right">
  Next
</app-button>

<!-- Icon Only -->
<app-button icon="settings" iconPosition="only"></app-button>
  `,

  // Destructive Variants
  destructive: `
<app-button [destructive]="true">Delete</app-button>
<app-button hierarchy="secondary" [destructive]="true" icon="delete">
  Remove Item
</app-button>
  `,

  // Loading State
  loading: `
<app-button [loading]="isSubmitting">
  {{ isSubmitting ? 'Submitting...' : 'Submit' }}
</app-button>

<!-- TypeScript -->
isSubmitting = false;

onSubmit() {
  this.isSubmitting = true;
  // API call...
}
  `,

  // Form Buttons
  formButtons: `
<form (submit)="onSubmit()">
  <!-- Submit Button -->
  <app-button
    type="submit"
    [loading]="isSubmitting"
    [disabled]="!form.valid">
    Submit
  </app-button>

  <!-- Reset Button -->
  <app-button
    type="reset"
    hierarchy="ghost"
    (clicked)="onReset()">
    Reset
  </app-button>
</form>
  `,

  // Full Width
  fullWidth: `
<app-button [fullWidth]="true" icon="language">
  Language Selection
</app-button>
  `,

  // Navigation
  navigation: `
<!-- Back Button -->
<app-button
  icon="arrow_back"
  iconPosition="left"
  hierarchy="ghost"
  (clicked)="goBack()">
  Back
</app-button>

<!-- Next Button -->
<app-button
  icon="arrow_forward"
  iconPosition="right"
  (clicked)="goNext()">
  Continue
</app-button>
  `,

  // CRUD Actions
  crudActions: `
<!-- Create -->
<app-button icon="add" iconPosition="left">
  Create New
</app-button>

<!-- Edit -->
<app-button
  hierarchy="secondary"
  icon="edit"
  iconPosition="left">
  Edit
</app-button>

<!-- Delete -->
<app-button
  hierarchy="secondary"
  [destructive]="true"
  icon="delete"
  iconPosition="left"
  (clicked)="onDelete()">
  Delete
</app-button>
  `,

  // Icon Buttons (Toolbars)
  iconButtons: `
<!-- Toolbar Icons -->
<div class="toolbar">
  <app-button
    icon="more_vert"
    iconPosition="only"
    hierarchy="ghost"
    size="sm">
  </app-button>

  <app-button
    icon="settings"
    iconPosition="only"
    hierarchy="ghost"
    size="sm">
  </app-button>

  <app-button
    icon="close"
    iconPosition="only"
    hierarchy="ghost"
    size="sm">
  </app-button>
</div>
  `,

  // Dark Mode Variant (if needed)
  darkMode: `
<!-- On dark background -->
<div class="dark-container">
  <app-button hierarchy="secondary">
    Button on Dark
  </app-button>
</div>
  `,

  // Complete Form Example
  completeExample: `
<form [formGroup]="myForm" (submit)="onSubmit()">
  <!-- Form fields here -->

  <div class="form-actions">
    <!-- Cancel -->
    <app-button
      type="button"
      hierarchy="ghost"
      [disabled]="isSubmitting"
      (clicked)="onCancel()">
      Cancel
    </app-button>

    <!-- Save Draft -->
    <app-button
      type="button"
      hierarchy="secondary"
      icon="save"
      iconPosition="left"
      [loading]="isSavingDraft"
      (clicked)="saveDraft()">
      Save Draft
    </app-button>

    <!-- Submit -->
    <app-button
      type="submit"
      hierarchy="primary"
      icon="check_circle"
      iconPosition="left"
      [loading]="isSubmitting"
      [disabled]="!myForm.valid">
      Submit
    </app-button>
  </div>
</form>

<!-- TypeScript Component -->
export class MyComponent {
  myForm: FormGroup;
  isSubmitting = false;
  isSavingDraft = false;

  onSubmit() {
    if (this.myForm.valid) {
      this.isSubmitting = true;
      // API call
    }
  }

  saveDraft() {
    this.isSavingDraft = true;
    // API call
  }

  onCancel() {
    // Navigate away or reset
  }
}
  `
};
