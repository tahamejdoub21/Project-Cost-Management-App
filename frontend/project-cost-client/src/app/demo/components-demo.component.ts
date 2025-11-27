import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AppInputComponent } from '../shared/components/app-input/app-input.component';
import { AppDatepickerComponent } from '../shared/components/app-datepicker/app-datepicker.component';
import { AppSelectComponent, SelectOption } from '../shared/components/app-select/app-select.component';
import { AppButtonComponent } from '../shared/components/app-button/app-button.component';
import { AppModalComponent } from '../shared/components/app-modal/app-modal.component';
import { ModalService, ModalSize } from '../shared/services/modal.service';
import { ModalFormDemoComponent } from './modal-form-demo/modal-form-demo.component';

@Component({
  selector: 'app-components-demo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AppInputComponent,
    AppDatepickerComponent,
    AppSelectComponent,
    AppButtonComponent,
    AppModalComponent,
  ],
  templateUrl: './components-demo.component.html',
  styleUrls: ['./components-demo.component.scss'],
})
export class ComponentsDemoComponent {
  form: FormGroup;
  isLoading = false;
  isSubmitting = false;

  // Select options
  countryOptions: SelectOption[] = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'au', label: 'Australia' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
    { value: 'jp', label: 'Japan' },
    { value: 'in', label: 'India' },
  ];

  currencyOptions: SelectOption[] = [
    { value: 'usd', label: 'USD - US Dollar' },
    { value: 'eur', label: 'EUR - Euro' },
    { value: 'gbp', label: 'GBP - British Pound' },
    { value: 'jpy', label: 'JPY - Japanese Yen' },
  ];

  timezoneOptions: SelectOption[] = [
    { value: 'pst', label: 'Pacific Standard Time', group: 'North America' },
    { value: 'mst', label: 'Mountain Standard Time', group: 'North America' },
    { value: 'cst', label: 'Central Standard Time', group: 'North America' },
    { value: 'est', label: 'Eastern Standard Time', group: 'North America' },
    { value: 'gmt', label: 'Greenwich Mean Time', group: 'Europe' },
    { value: 'cet', label: 'Central European Time', group: 'Europe' },
    { value: 'jst', label: 'Japan Standard Time', group: 'Asia' },
    { value: 'ist', label: 'Indian Standard Time', group: 'Asia' },
  ];

  minDate = new Date();
  maxDate = new Date();

  // Test form for overlay manager
  testDate1: Date | null = null;
  testDate2: Date | null = null;
  testSelect1: string = '';
  testSelect2: string = '';
  testPhoneCountry: string = 'US';

  constructor(
    private fb: FormBuilder,
    private modalService: ModalService
  ) {
    // Set min/max dates
    this.minDate.setDate(this.minDate.getDate() - 30);
    this.maxDate.setDate(this.maxDate.getDate() + 90);

    // Initialize form
    this.form = this.fb.group({
      // Basic inputs
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],

      // Additional inputs
      phone: [''],
      website: [''],
      accountNumber: [''],

      // Select inputs
      country: ['', Validators.required],
      currency: ['usd'],
      timezone: [''],

      // Date inputs
      dob: [''],
      startDate: ['', Validators.required],

      // Numeric inputs
      price: ['', [Validators.min(0)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.isSubmitting = true;
      console.log('Form submitted:', this.form.value);

      // Simulate API call
      setTimeout(() => {
        this.isSubmitting = false;
        alert('Form submitted successfully! Check console for values.');
      }, 2000);
    } else {
      console.log('Form is invalid');
      this.markFormGroupTouched(this.form);
    }
  }

  simulateLoading() {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
  }

  handleClick(action: string) {
    console.log('Button clicked:', action);
  }

  handleDelete() {
    if (confirm('Are you sure you want to delete this item?')) {
      console.log('Item deleted');
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  onReset() {
    this.form.reset();
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control?.touched || !control?.errors) return '';

    if (control.errors['required']) return 'This field is required';
    if (control.errors['email']) return 'Please enter a valid email';
    if (control.errors['minlength']) {
      return `Minimum length is ${control.errors['minlength'].requiredLength}`;
    }
    if (control.errors['min']) return `Minimum value is ${control.errors['min'].min}`;

    return 'Invalid value';
  }

  // ============================================
  // MODAL METHODS
  // ============================================

  /**
   * Open a dialog modal with different sizes
   */
  openDialogModal(size: ModalSize): void {
    this.modalService.openDialog({
      title: `${size.toUpperCase()} Dialog Modal`,
      content: `This is a ${size} sized dialog modal. You can use different sizes to match your content needs. Dialog modals are centered on the screen and perfect for confirmations, forms, and important information.`,
      size,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      onConfirm: () => {
        console.log('Dialog confirmed!');
      }
    });
  }

  /**
   * Open a confirmation dialog
   */
  openConfirmDialog(): void {
    this.modalService.openDialog({
      title: 'Confirm Your Action',
      content: 'Are you sure you want to proceed with this action? This will make changes to your account settings.',
      size: 'sm',
      confirmText: 'Yes, Proceed',
      cancelText: 'Cancel',
      onConfirm: () => {
        console.log('User confirmed the action');
        this.modalService.success('Action Completed', 'Your changes have been saved successfully.');
      },
      onCancel: () => {
        console.log('User cancelled the action');
      }
    });
  }

  /**
   * Open a form dialog
   */
  openFormDialog(): void {
    this.modalService.openDialog({
      title: 'Create New Project',
      content: 'This dialog would contain a form. You can inject custom components to create complex forms within modals.',
      size: 'lg',
      confirmText: 'Create Project',
      cancelText: 'Cancel',
      onConfirm: async () => {
        console.log('Creating project...');
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Project created!');
      }
    });
  }

  /**
   * Show success alert
   */
  showSuccessAlert(): void {
    this.modalService.success(
      'Success!',
      'Your operation completed successfully. All changes have been saved.'
    );
  }

  /**
   * Show info alert
   */
  showInfoAlert(): void {
    this.modalService.info(
      'Information',
      'This is an informational message. Click OK to dismiss.'
    );
  }

  /**
   * Show warning alert
   */
  showWarningAlert(): void {
    this.modalService.warning(
      'Warning',
      'Please review your input before proceeding. Some fields may need your attention.'
    );
  }

  /**
   * Show error alert
   */
  showErrorAlert(): void {
    this.modalService.error(
      'Error Occurred',
      'Something went wrong while processing your request. Please try again later.'
    );
  }

  /**
   * Show confirmation
   */
  async showConfirmation(): Promise<void> {
    const confirmed = await this.modalService.confirm(
      'Confirm Action',
      'Do you want to proceed with this action?'
    );

    if (confirmed) {
      console.log('User confirmed');
      this.modalService.success('Confirmed', 'Action completed successfully!');
    } else {
      console.log('User cancelled');
    }
  }

  /**
   * Show delete confirmation
   */
  async showDeleteConfirmation(): Promise<void> {
    this.modalService.openAlert({
      title: 'Delete Item',
      content: 'Are you sure you want to delete this item? This action cannot be undone.',
      alertType: 'error',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        console.log('Item deleted');
        this.modalService.success('Deleted', 'Item has been permanently deleted.');
      }
    });
  }

  /**
   * Open drawer panel
   */
  openDrawer(side: 'left' | 'right', size: ModalSize): void {
    const openMethod = side === 'right'
      ? this.modalService.openDrawerRight.bind(this.modalService)
      : this.modalService.openDrawerLeft.bind(this.modalService);

    openMethod({
      title: `${side.charAt(0).toUpperCase() + side.slice(1)} Drawer - ${size.toUpperCase()}`,
      content: `This is a ${size} sized drawer sliding from the ${side}. Drawers are perfect for settings panels, filters, navigation menus, and supplementary content that doesn't need to interrupt the user's main workflow.`,
      size,
      confirmText: 'Save Changes',
      cancelText: 'Close'
    });
  }

  /**
   * Open settings panel
   */
  openSettingsPanel(): void {
    this.modalService.openDrawerRight({
      title: 'Settings',
      content: `
        Here you would configure your application settings:
        • Profile Settings
        • Privacy & Security
        • Notifications
        • Appearance
        • Language & Region

        This drawer provides a non-intrusive way to access settings without leaving your current context.
      `,
      size: 'md',
      confirmText: 'Save Settings',
      cancelText: 'Close'
    });
  }

  /**
   * Open notifications panel
   */
  openNotificationsPanel(): void {
    this.modalService.openDrawerRight({
      title: 'Notifications',
      content: `
        Recent Notifications:

        • New project assigned to you (2 min ago)
        • Team member commented on your task (15 min ago)
        • Budget alert: Project X exceeded 80% (1 hour ago)
        • System update scheduled for tonight (2 hours ago)

        Drawers are ideal for displaying lists and supplementary information.
      `,
      size: 'sm',
      confirmText: 'Mark All Read',
      cancelText: 'Close'
    });
  }

  /**
   * Open filters panel
   */
  openFiltersPanel(): void {
    this.modalService.openDrawerLeft({
      title: 'Filters',
      content: `
        Filter Options:

        • Date Range
        • Status
        • Priority
        • Assigned To
        • Category
        • Budget Range

        Use this panel to refine your search results. Left drawers work great for filters and navigation menus.
      `,
      size: 'md',
      confirmText: 'Apply Filters',
      cancelText: 'Reset'
    });
  }

  /**
   * Open nested modal example
   */
  openNestedModal(): void {
    this.modalService.openDialog({
      title: 'First Modal',
      content: 'This is the first modal. Click the button below to open a second modal on top.',
      size: 'md',
      confirmText: 'Open Second Modal',
      cancelText: 'Close',
      onConfirm: () => {
        this.modalService.openDialog({
          title: 'Second Modal',
          content: 'This is a nested modal! Our modal system supports stacking multiple modals with proper z-index management and focus trapping.',
          size: 'sm',
          confirmText: 'Got it',
          onConfirm: () => {
            console.log('Nested modal closed');
          }
        });
      }
    });
  }

  /**
   * Open async modal
   */
  openAsyncModal(): void {
    this.modalService.openDialog({
      title: 'Async Action',
      content: 'Click confirm to simulate an async operation (like an API call). The modal will handle the promise automatically.',
      size: 'sm',
      confirmText: 'Start Operation',
      cancelText: 'Cancel',
      onConfirm: async () => {
        console.log('Starting async operation...');
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('Operation completed!');
        this.modalService.success('Complete', 'Async operation completed successfully!');
      }
    });
  }

  /**
   * Open scrollable modal with long content
   */
  openScrollableModal(): void {
    const longContent = `
      This modal demonstrates scroll behavior with long content.

      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

      Key Features of Our Modal System:

      1. Focus Management
         - Automatic focus on first interactive element
         - Focus trap keeps users within the modal
         - Returns focus to trigger element on close

      2. Keyboard Navigation
         - ESC key to close (configurable)
         - TAB cycling through focusable elements
         - Full keyboard accessibility

      3. Scroll Behavior
         - Body scroll lock when modal is open
         - Smooth custom scrollbars
         - Remembers scroll position

      4. Professional Animations
         - Smooth fade-in for backdrops
         - Scale and slide animations
         - Drawer slide-in from sides
         - Respects prefers-reduced-motion

      5. Responsive Design
         - Mobile-first approach
         - Adapts to screen sizes
         - Full-width on mobile devices
         - Touch-friendly interactions

      6. Accessibility (WCAG 2.1)
         - Proper ARIA attributes
         - Role management
         - Screen reader support
         - High contrast support

      7. Multiple Types
         - Dialog modals (centered)
         - Alert modals (notifications)
         - Right drawers (settings, cart)
         - Left drawers (filters, nav)

      This content is scrollable within the modal body, while the header and footer remain fixed. The modal maintains proper dimensions and doesn't grow beyond the viewport.

      Try scrolling to see the custom scrollbar styling that matches our design system!
    `;

    this.modalService.openDialog({
      title: 'Long Content Example',
      content: longContent,
      size: 'lg',
      confirmText: 'Close',
    });
  }

  /**
   * Open modal with full form (all input components)
   */
  openFullFormModal(): void {
    this.modalService.openDialog({
      title: 'Complete Form Example',
      component: ModalFormDemoComponent,
      size: 'xl',
      confirmText: 'Submit Form',
      cancelText: 'Cancel',
      onConfirm: async () => {
        console.log('Form submission started...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        this.modalService.success('Form Submitted!', 'All form data has been saved successfully.');
      }
    });
  }
}

