import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AppInputComponent } from '../../shared/components/app-input/app-input.component';
import { AppDatepickerComponent } from '../../shared/components/app-datepicker/app-datepicker.component';
import { AppSelectComponent, SelectOption } from '../../shared/components/app-select/app-select.component';

@Component({
  selector: 'app-modal-form-demo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AppInputComponent,
    AppDatepickerComponent,
    AppSelectComponent
  ],
  templateUrl: './modal-form-demo.component.html',
  styleUrl: './modal-form-demo.component.scss'
})
export class ModalFormDemoComponent {
  form: FormGroup;

  // Select options
  countryOptions: SelectOption[] = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'au', label: 'Australia' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
  ];

  categoryOptions: SelectOption[] = [
    { value: 'work', label: 'Work', group: 'Professional' },
    { value: 'business', label: 'Business', group: 'Professional' },
    { value: 'personal', label: 'Personal', group: 'Personal' },
    { value: 'family', label: 'Family', group: 'Personal' },
    { value: 'other', label: 'Other', group: 'General' },
  ];

  priorityOptions: SelectOption[] = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'urgent', label: 'Urgent' },
  ];

  minDate = new Date();
  maxDate = new Date();

  constructor(private fb: FormBuilder) {
    // Set min/max dates
    this.minDate.setDate(this.minDate.getDate() - 30);
    this.maxDate.setDate(this.maxDate.getDate() + 90);

    // Initialize form
    this.form = this.fb.group({
      // Personal Information
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],

      // Address
      address: [''],
      city: [''],
      country: ['', Validators.required],

      // Project Details
      projectName: ['', Validators.required],
      category: [''],
      priority: ['medium'],

      // Dates
      startDate: ['', Validators.required],
      endDate: [''],

      // Additional
      budget: ['', [Validators.min(0)]],
      description: [''],
      website: [''],
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control?.touched || !control?.errors) return '';

    if (control.errors['required']) return 'This field is required';
    if (control.errors['email']) return 'Please enter a valid email';
    if (control.errors['min']) return `Minimum value is ${control.errors['min'].min}`;

    return 'Invalid value';
  }

  getFormValue(): any {
    return this.form.value;
  }

  isValid(): boolean {
    return this.form.valid;
  }

  markAllAsTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });
  }
}
