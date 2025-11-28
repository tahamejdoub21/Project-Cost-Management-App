import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AppInputComponent } from '../../shared/components/app-input/app-input.component';
import { AppSelect, SelectOption } from '../../shared/components/app-select/app-select';
import { AppTextarea } from '../../shared/components/app-textarea/app-textarea';

@Component({
  selector: 'app-inputs-demo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AppInputComponent,
    AppSelect,
    AppTextarea
  ],
  templateUrl: './inputs-demo.html',
  styleUrl: './inputs-demo.scss',
})
export class InputsDemo implements OnInit {
  demoForm!: FormGroup;

  // Select options
  selectOptions: SelectOption[] = [
    { label: 'Option 1', value: '1', icon: 'star' },
    { label: 'Option 2', value: '2', icon: 'favorite' },
    { label: 'Option 3', value: '3', icon: 'bookmark' },
    { label: 'Disabled Option', value: '4', disabled: true },
  ];

  statusOptions: SelectOption[] = [
    { label: 'Active', value: 'active', icon: 'check_circle', description: 'Currently active' },
    { label: 'Pending', value: 'pending', icon: 'schedule', description: 'Awaiting approval' },
    { label: 'Completed', value: 'completed', icon: 'done_all', description: 'Task finished' },
    { label: 'Cancelled', value: 'cancelled', icon: 'cancel', description: 'Task cancelled' },
  ];

  categoryOptions: SelectOption[] = [
    { label: 'Development', value: 'dev' },
    { label: 'Design', value: 'design' },
    { label: 'Marketing', value: 'marketing' },
    { label: 'Sales', value: 'sales' },
    { label: 'Support', value: 'support' },
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.demoForm = this.fb.group({
      // Text inputs
      textField: ['', [Validators.required, Validators.minLength(3)]],
      emailField: ['', [Validators.required, Validators.email]],
      passwordField: ['', [Validators.required, Validators.minLength(8)]],
      numberField: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      searchField: [''],
      telField: [''],
      urlField: [''],
      dateField: [''],

      // Select fields
      selectField: [''],
      statusField: [''],
      categoryField: [''],

      // Textarea
      textareaField: ['', [Validators.maxLength(500)]],
      descriptionField: [''],
    });
  }

  onSubmit(): void {
    if (this.demoForm.valid) {
      console.log('Form submitted:', this.demoForm.value);
      alert('Form is valid! Check console for values.');
    } else {
      console.log('Form is invalid');
      this.markFormGroupTouched(this.demoForm);
    }
  }

  onReset(): void {
    this.demoForm.reset();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
