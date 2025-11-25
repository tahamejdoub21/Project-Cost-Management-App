/**
 * APP INPUT COMPONENT - USAGE EXAMPLES
 *
 * This file contains practical examples of using the AppInput component
 * in various scenarios throughout your application.
 */

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AppInputComponent } from './app-input.component';

// ============================================
// EXAMPLE 1: Simple Login Form
// ============================================

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [AppInputComponent, ReactiveFormsModule],
  template: `
    <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
      <app-input
        label="Email"
        type="email"
        formControlName="email"
        placeholder="you@example.com"
        [required]="true"
        [iconLeft]="{ name: 'email', type: 'material' }"
        autocomplete="email"
      >
      </app-input>

      <app-input
        label="Password"
        type="password"
        formControlName="password"
        placeholder="Enter your password"
        [required]="true"
        [showPasswordToggle]="true"
        [minlength]="8"
        autocomplete="current-password"
      >
      </app-input>

      <button type="submit" [disabled]="!loginForm.valid">Login</button>
    </form>
  `
})
export class LoginFormExample {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      console.log('Login:', this.loginForm.value);
    }
  }
}

// ============================================
// EXAMPLE 2: User Registration Form
// ============================================

@Component({
  selector: 'app-registration-form',
  standalone: true,
  imports: [AppInputComponent, ReactiveFormsModule],
  template: `
    <form [formGroup]="registrationForm" (ngSubmit)="onRegister()">
      <!-- Full Name -->
      <app-input
        label="Full Name"
        formControlName="fullName"
        placeholder="John Doe"
        [required]="true"
        [minlength]="2"
        [maxlength]="50"
        [showCounter]="true"
        [iconLeft]="{ name: 'person', type: 'material' }"
        autocomplete="name"
      >
      </app-input>

      <!-- Email -->
      <app-input
        label="Email Address"
        type="email"
        formControlName="email"
        placeholder="john@example.com"
        [required]="true"
        [loading]="checkingEmail"
        [iconLeft]="{ name: 'email', type: 'material' }"
        [debounceTime]="500"
        (valueChange)="checkEmailAvailability($event)"
        autocomplete="email"
      >
      </app-input>

      <!-- Phone -->
      <app-input
        label="Phone Number"
        type="tel"
        formControlName="phone"
        placeholder="(555) 123-4567"
        [iconLeft]="{ name: 'phone', type: 'material' }"
        hint="Enter your phone number"
        autocomplete="tel"
      >
      </app-input>

      <!-- Password -->
      <app-input
        label="Password"
        type="password"
        formControlName="password"
        placeholder="Create a strong password"
        [required]="true"
        [minlength]="8"
        [maxlength]="50"
        [showPasswordToggle]="true"
        [showCounter]="true"
        hint="At least 8 characters with letters and numbers"
        (valueChange)="checkPasswordStrength($event)"
        autocomplete="new-password"
      >
      </app-input>

      <!-- Confirm Password -->
      <app-input
        label="Confirm Password"
        type="password"
        formControlName="confirmPassword"
        placeholder="Re-enter your password"
        [required]="true"
        [showPasswordToggle]="true"
        autocomplete="new-password"
      >
      </app-input>

      <button type="submit" [disabled]="!registrationForm.valid">Register</button>
    </form>
  `
})
export class RegistrationFormExample {
  registrationForm: FormGroup;
  checkingEmail = false;

  constructor(private fb: FormBuilder) {
    this.registrationForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\d{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  checkEmailAvailability(email: string) {
    this.checkingEmail = true;
    // Simulate API call
    setTimeout(() => {
      this.checkingEmail = false;
    }, 1000);
  }

  checkPasswordStrength(password: string) {
    // Implement password strength logic
    console.log('Password strength check:', password);
  }

  onRegister() {
    if (this.registrationForm.valid) {
      console.log('Registration:', this.registrationForm.value);
    }
  }
}

// ============================================
// EXAMPLE 3: Project Creation Form
// ============================================

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [AppInputComponent, ReactiveFormsModule],
  template: `
    <form [formGroup]="projectForm" (ngSubmit)="onCreateProject()">
      <!-- Project Name -->
      <app-input
        label="Project Name"
        formControlName="projectName"
        placeholder="My Awesome Project"
        [required]="true"
        [maxlength]="100"
        [showCounter]="true"
        [iconLeft]="{ name: 'folder', type: 'material', color: '#3b82f6' }"
      >
      </app-input>

      <!-- Project Code -->
      <app-input
        label="Project Code"
        formControlName="projectCode"
        placeholder="PROJ-001"
        [required]="true"
        [uppercase]="true"
        [pattern]="'^[A-Z]{3,4}-[0-9]{3}$'"
        hint="Format: ABC-123"
        [iconLeft]="{ name: 'tag', type: 'material' }"
      >
      </app-input>

      <!-- Budget -->
      <app-input
        label="Project Budget"
        type="number"
        formControlName="budget"
        placeholder="0.00"
        [required]="true"
        [min]="0"
        [step]="0.01"
        inputmode="decimal"
        [iconLeft]="{ name: 'attach_money', type: 'material', color: '#22c55e' }"
        hint="Total project budget in USD"
      >
      </app-input>

      <!-- Start Date -->
      <app-input
        label="Start Date"
        type="date"
        formControlName="startDate"
        [required]="true"
        [min]="todayDate"
        [iconLeft]="{ name: 'calendar_today', type: 'material' }"
      >
      </app-input>

      <!-- End Date -->
      <app-input
        label="End Date"
        type="date"
        formControlName="endDate"
        [required]="true"
        [iconLeft]="{ name: 'event', type: 'material' }"
      >
      </app-input>

      <!-- Description -->
      <app-input
        label="Project Description"
        formControlName="description"
        placeholder="Brief description of the project..."
        [maxlength]="500"
        [showCounter]="true"
        variant="fill"
        height="120px"
      >
      </app-input>

      <button type="submit" [disabled]="!projectForm.valid">Create Project</button>
    </form>
  `
})
export class ProjectFormExample {
  projectForm: FormGroup;
  todayDate = new Date().toISOString().split('T')[0];

  constructor(private fb: FormBuilder) {
    this.projectForm = this.fb.group({
      projectName: ['', [Validators.required, Validators.maxLength(100)]],
      projectCode: ['', [Validators.required, Validators.pattern(/^[A-Z]{3,4}-[0-9]{3}$/)]],
      budget: ['', [Validators.required, Validators.min(0)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      description: ['', [Validators.maxLength(500)]]
    });
  }

  onCreateProject() {
    if (this.projectForm.valid) {
      console.log('Create Project:', this.projectForm.value);
    }
  }
}

// ============================================
// EXAMPLE 4: Search and Filter Form
// ============================================

@Component({
  selector: 'app-search-filter',
  standalone: true,
  imports: [AppInputComponent, ReactiveFormsModule],
  template: `
    <div class="search-filters">
      <!-- Search Bar -->
      <app-input
        type="search"
        placeholder="Search projects..."
        [clearable]="true"
        [debounceTime]="300"
        [iconLeft]="{ name: 'search', type: 'material' }"
        (valueChange)="onSearch($event)"
        variant="fill"
      >
      </app-input>

      <!-- Filter by Status -->
      <app-input
        label="Status"
        formControlName="status"
        placeholder="All statuses"
        [clearable]="true"
      >
      </app-input>

      <!-- Filter by Date Range -->
      <app-input
        label="From Date"
        type="date"
        formControlName="fromDate"
        [iconLeft]="{ name: 'date_range', type: 'material' }"
      >
      </app-input>

      <app-input
        label="To Date"
        type="date"
        formControlName="toDate"
        [iconLeft]="{ name: 'date_range', type: 'material' }"
      >
      </app-input>

      <!-- Filter by Amount -->
      <app-input
        label="Min Budget"
        type="number"
        formControlName="minBudget"
        placeholder="0"
        [min]="0"
        inputmode="numeric"
      >
      </app-input>

      <app-input
        label="Max Budget"
        type="number"
        formControlName="maxBudget"
        placeholder="10000"
        [min]="0"
        inputmode="numeric"
      >
      </app-input>
    </div>
  `
})
export class SearchFilterExample {
  filterForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      status: [''],
      fromDate: [''],
      toDate: [''],
      minBudget: [0],
      maxBudget: [10000]
    });
  }

  onSearch(query: string) {
    console.log('Searching for:', query);
    // Implement search logic
  }
}

// ============================================
// EXAMPLE 5: Location Input with Geolocation
// ============================================

@Component({
  selector: 'app-location-input',
  standalone: true,
  imports: [AppInputComponent, ReactiveFormsModule],
  template: `
    <app-input
      label="Location"
      formControlName="location"
      placeholder="Enter location or use GPS"
      [iconLeft]="{ name: 'location_on', type: 'material', color: '#ef4444' }"
      [iconRight]="{
        name: 'my_location',
        type: 'material',
        clickable: true,
        tooltip: 'Use my current location',
        color: '#3b82f6'
      }"
      [loading]="fetchingLocation"
      (rightIconClick)="getCurrentLocation()"
      hint="Click GPS icon to use your current location"
    >
    </app-input>
  `
})
export class LocationInputExample {
  locationForm: FormGroup;
  fetchingLocation = false;

  constructor(private fb: FormBuilder) {
    this.locationForm = this.fb.group({
      location: ['', Validators.required]
    });
  }

  getCurrentLocation() {
    this.fetchingLocation = true;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.locationForm.patchValue({
            location: `${latitude}, ${longitude}`
          });
          this.fetchingLocation = false;
        },
        (error) => {
          console.error('Geolocation error:', error);
          this.fetchingLocation = false;
        }
      );
    }
  }
}

// ============================================
// EXAMPLE 6: Time Entry Form
// ============================================

@Component({
  selector: 'app-time-entry',
  standalone: true,
  imports: [AppInputComponent, ReactiveFormsModule],
  template: `
    <form [formGroup]="timeEntryForm" (ngSubmit)="onSubmitTimeEntry()">
      <!-- Task -->
      <app-input
        label="Task"
        formControlName="task"
        placeholder="What did you work on?"
        [required]="true"
        [iconLeft]="{ name: 'task', type: 'material' }"
      >
      </app-input>

      <!-- Hours -->
      <app-input
        label="Hours"
        type="number"
        formControlName="hours"
        placeholder="0"
        [required]="true"
        [min]="0"
        [max]="24"
        [step]="0.5"
        inputmode="decimal"
        [iconLeft]="{ name: 'schedule', type: 'material', color: '#a855f7' }"
        hint="Hours worked (0.5 increments)"
      >
      </app-input>

      <!-- Date -->
      <app-input
        label="Date"
        type="date"
        formControlName="date"
        [required]="true"
        [max]="todayDate"
        [iconLeft]="{ name: 'calendar_today', type: 'material' }"
      >
      </app-input>

      <!-- Notes -->
      <app-input
        label="Notes"
        formControlName="notes"
        placeholder="Additional details..."
        [maxlength]="300"
        [showCounter]="true"
        variant="fill"
      >
      </app-input>

      <button type="submit" [disabled]="!timeEntryForm.valid">Log Time</button>
    </form>
  `
})
export class TimeEntryExample {
  timeEntryForm: FormGroup;
  todayDate = new Date().toISOString().split('T')[0];

  constructor(private fb: FormBuilder) {
    this.timeEntryForm = this.fb.group({
      task: ['', Validators.required],
      hours: ['', [Validators.required, Validators.min(0), Validators.max(24)]],
      date: [this.todayDate, Validators.required],
      notes: ['', Validators.maxLength(300)]
    });
  }

  onSubmitTimeEntry() {
    if (this.timeEntryForm.valid) {
      console.log('Time Entry:', this.timeEntryForm.value);
    }
  }
}

// ============================================
// EXPORT ALL EXAMPLES
// ============================================

export const APP_INPUT_EXAMPLES = {
  LoginFormExample,
  RegistrationFormExample,
  ProjectFormExample,
  SearchFilterExample,
  LocationInputExample,
  TimeEntryExample
};
