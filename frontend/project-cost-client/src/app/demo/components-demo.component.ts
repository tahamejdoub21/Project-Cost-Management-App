import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AppInputComponent } from '../shared/components/app-input/app-input.component';
import { AppDatepickerComponent } from '../shared/components/app-datepicker/app-datepicker.component';
import { AppSelectComponent, SelectOption } from '../shared/components/app-select/app-select.component';

@Component({
  selector: 'app-components-demo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AppInputComponent,
    AppDatepickerComponent,
    AppSelectComponent,
  ],
  templateUrl: './components-demo.component.html',
  styleUrls: ['./components-demo.component.scss'],
})
export class ComponentsDemoComponent {
  form: FormGroup;

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

  constructor(private fb: FormBuilder) {
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
      console.log('Form submitted:', this.form.value);
      alert('Form submitted successfully! Check console for values.');
    } else {
      console.log('Form is invalid');
      this.markFormGroupTouched(this.form);
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
}
