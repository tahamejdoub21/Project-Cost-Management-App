/**
 * APP MULTISELECT COMPONENT - USAGE EXAMPLES
 *
 * This file contains practical examples of using the AppMultiselect component
 * in various scenarios throughout your application.
 */

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AppMultiselect, MultiselectOption } from './app-multiselect';

// ============================================
// EXAMPLE 1: Basic Multi-Select
// ============================================

@Component({
  selector: 'app-basic-multiselect-example',
  standalone: true,
  imports: [AppMultiselect, ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <app-multiselect
        label="Select Skills"
        formControlName="skills"
        placeholder="Choose your skills"
        [options]="skillOptions"
        [searchable]="true"
        [clearable]="true"
        hint="Select all that apply"
      >
      </app-multiselect>
    </form>
  `
})
export class BasicMultiselectExample {
  form: FormGroup;

  skillOptions: MultiselectOption[] = [
    { value: 'js', label: 'JavaScript' },
    { value: 'ts', label: 'TypeScript' },
    { value: 'angular', label: 'Angular' },
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue.js' },
    { value: 'node', label: 'Node.js' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' }
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      skills: [[]]
    });
  }
}

// ============================================
// EXAMPLE 2: Project Team Selection
// ============================================

@Component({
  selector: 'app-team-selection',
  standalone: true,
  imports: [AppMultiselect, ReactiveFormsModule],
  template: `
    <form [formGroup]="projectForm" (ngSubmit)="onSubmit()">
      <app-multiselect
        label="Team Members"
        formControlName="teamMembers"
        placeholder="Select team members"
        [options]="teamOptions"
        [required]="true"
        [searchable]="true"
        [clearable]="true"
        hint="Select at least 2 team members"
      >
      </app-multiselect>

      <app-multiselect
        label="Project Tags"
        formControlName="tags"
        placeholder="Add tags"
        [options]="tagOptions"
        [searchable]="true"
        [clearable]="true"
      >
      </app-multiselect>

      <button type="submit" [disabled]="!projectForm.valid">Create Project</button>
    </form>
  `
})
export class TeamSelectionExample {
  projectForm: FormGroup;

  teamOptions: MultiselectOption[] = [
    { value: '1', label: 'John Doe', icon: 'person', description: 'Frontend Developer' },
    { value: '2', label: 'Jane Smith', icon: 'person', description: 'Backend Developer' },
    { value: '3', label: 'Bob Johnson', icon: 'person', description: 'UI/UX Designer' },
    { value: '4', label: 'Alice Williams', icon: 'person', description: 'Project Manager' },
    { value: '5', label: 'Charlie Brown', icon: 'person', description: 'QA Engineer' },
    { value: '6', label: 'Diana Prince', icon: 'person', description: 'DevOps Engineer' }
  ];

  tagOptions: MultiselectOption[] = [
    { value: 'urgent', label: 'Urgent', icon: 'priority_high' },
    { value: 'bug', label: 'Bug Fix', icon: 'bug_report' },
    { value: 'feature', label: 'Feature', icon: 'new_releases' },
    { value: 'enhancement', label: 'Enhancement', icon: 'upgrade' },
    { value: 'documentation', label: 'Documentation', icon: 'description' }
  ];

  constructor(private fb: FormBuilder) {
    this.projectForm = this.fb.group({
      teamMembers: [[], [Validators.required, Validators.minLength(2)]],
      tags: [[]]
    });
  }

  onSubmit() {
    if (this.projectForm.valid) {
      console.log('Project Created:', this.projectForm.value);
    }
  }
}

// ============================================
// EXAMPLE 3: Filter Selection
// ============================================

@Component({
  selector: 'app-filter-multiselect',
  standalone: true,
  imports: [AppMultiselect, ReactiveFormsModule],
  template: `
    <div class="filters">
      <h3>Filter Projects</h3>

      <app-multiselect
        label="Status"
        formControlName="status"
        placeholder="All statuses"
        [options]="statusOptions"
        [searchable]="false"
        [clearable]="true"
        (valueChange)="onFilterChange()"
      >
      </app-multiselect>

      <app-multiselect
        label="Categories"
        formControlName="categories"
        placeholder="All categories"
        [options]="categoryOptions"
        [searchable]="true"
        [clearable]="true"
        (valueChange)="onFilterChange()"
      >
      </app-multiselect>

      <app-multiselect
        label="Priority"
        formControlName="priority"
        placeholder="All priorities"
        [options]="priorityOptions"
        [clearable]="true"
        (valueChange)="onFilterChange()"
      >
      </app-multiselect>
    </div>
  `
})
export class FilterMultiselectExample {
  filterForm: FormGroup;

  statusOptions: MultiselectOption[] = [
    { value: 'active', label: 'Active', icon: 'play_arrow' },
    { value: 'pending', label: 'Pending', icon: 'pending' },
    { value: 'completed', label: 'Completed', icon: 'check_circle' },
    { value: 'cancelled', label: 'Cancelled', icon: 'cancel' }
  ];

  categoryOptions: MultiselectOption[] = [
    { value: 'web', label: 'Web Development', icon: 'language' },
    { value: 'mobile', label: 'Mobile Apps', icon: 'phone_android' },
    { value: 'design', label: 'Design', icon: 'palette' },
    { value: 'marketing', label: 'Marketing', icon: 'campaign' },
    { value: 'analytics', label: 'Analytics', icon: 'analytics' },
    { value: 'infrastructure', label: 'Infrastructure', icon: 'cloud' }
  ];

  priorityOptions: MultiselectOption[] = [
    { value: 'critical', label: 'Critical', icon: 'report_problem', description: 'Highest priority' },
    { value: 'high', label: 'High', icon: 'arrow_upward', description: 'High priority' },
    { value: 'medium', label: 'Medium', icon: 'remove', description: 'Medium priority' },
    { value: 'low', label: 'Low', icon: 'arrow_downward', description: 'Low priority' }
  ];

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      status: [[]],
      categories: [[]],
      priority: [[]]
    });
  }

  onFilterChange() {
    console.log('Filters updated:', this.filterForm.value);
    // Apply filters to data
  }
}

// ============================================
// EXAMPLE 4: Permission Management
// ============================================

@Component({
  selector: 'app-permission-multiselect',
  standalone: true,
  imports: [AppMultiselect, ReactiveFormsModule],
  template: `
    <form [formGroup]="permissionForm" (ngSubmit)="onSave()">
      <app-multiselect
        label="User Permissions"
        formControlName="permissions"
        placeholder="Select permissions"
        [options]="permissionOptions"
        [required]="true"
        [searchable]="true"
        [clearable]="true"
        [showSelectAll]="true"
        hint="Select all permissions for this role"
        (selectionChange)="onPermissionChange($event)"
      >
      </app-multiselect>

      <button type="submit" [disabled]="!permissionForm.valid">Save Permissions</button>
    </form>
  `
})
export class PermissionMultiselectExample {
  permissionForm: FormGroup;

  permissionOptions: MultiselectOption[] = [
    { value: 'users_view', label: 'View Users', icon: 'visibility', description: 'Can view user list' },
    { value: 'users_create', label: 'Create Users', icon: 'person_add', description: 'Can create new users' },
    { value: 'users_edit', label: 'Edit Users', icon: 'edit', description: 'Can edit user details' },
    { value: 'users_delete', label: 'Delete Users', icon: 'delete', description: 'Can delete users' },
    { value: 'projects_view', label: 'View Projects', icon: 'folder', description: 'Can view projects' },
    { value: 'projects_create', label: 'Create Projects', icon: 'create_new_folder', description: 'Can create projects' },
    { value: 'projects_edit', label: 'Edit Projects', icon: 'edit', description: 'Can edit projects' },
    { value: 'projects_delete', label: 'Delete Projects', icon: 'delete_forever', description: 'Can delete projects' },
    { value: 'reports_view', label: 'View Reports', icon: 'assessment', description: 'Can view reports' },
    { value: 'reports_export', label: 'Export Reports', icon: 'download', description: 'Can export reports' },
    { value: 'settings_manage', label: 'Manage Settings', icon: 'settings', description: 'Can manage system settings' }
  ];

  constructor(private fb: FormBuilder) {
    this.permissionForm = this.fb.group({
      permissions: [[], Validators.required]
    });
  }

  onPermissionChange(selected: MultiselectOption[]) {
    console.log('Selected permissions:', selected);
  }

  onSave() {
    if (this.permissionForm.valid) {
      console.log('Permissions saved:', this.permissionForm.value);
    }
  }
}

// ============================================
// EXAMPLE 5: Country/Location Selection
// ============================================

@Component({
  selector: 'app-location-multiselect',
  standalone: true,
  imports: [AppMultiselect, ReactiveFormsModule],
  template: `
    <form [formGroup]="locationForm">
      <app-multiselect
        label="Target Countries"
        formControlName="countries"
        placeholder="Select countries"
        [options]="countryOptions"
        [searchable]="true"
        [clearable]="true"
        [maxHeight]="'350px'"
        hint="Select target markets for your campaign"
      >
      </app-multiselect>

      <app-multiselect
        label="Languages"
        formControlName="languages"
        placeholder="Select languages"
        [options]="languageOptions"
        [searchable]="true"
        [clearable]="true"
      >
      </app-multiselect>
    </form>
  `
})
export class LocationMultiselectExample {
  locationForm: FormGroup;

  countryOptions: MultiselectOption[] = [
    { value: 'us', label: 'United States', icon: 'public' },
    { value: 'ca', label: 'Canada', icon: 'public' },
    { value: 'uk', label: 'United Kingdom', icon: 'public' },
    { value: 'de', label: 'Germany', icon: 'public' },
    { value: 'fr', label: 'France', icon: 'public' },
    { value: 'es', label: 'Spain', icon: 'public' },
    { value: 'it', label: 'Italy', icon: 'public' },
    { value: 'jp', label: 'Japan', icon: 'public' },
    { value: 'au', label: 'Australia', icon: 'public' },
    { value: 'br', label: 'Brazil', icon: 'public' },
    { value: 'in', label: 'India', icon: 'public' },
    { value: 'cn', label: 'China', icon: 'public' }
  ];

  languageOptions: MultiselectOption[] = [
    { value: 'en', label: 'English', icon: 'language' },
    { value: 'es', label: 'Spanish', icon: 'language' },
    { value: 'fr', label: 'French', icon: 'language' },
    { value: 'de', label: 'German', icon: 'language' },
    { value: 'it', label: 'Italian', icon: 'language' },
    { value: 'pt', label: 'Portuguese', icon: 'language' },
    { value: 'zh', label: 'Chinese', icon: 'language' },
    { value: 'ja', label: 'Japanese', icon: 'language' },
    { value: 'ar', label: 'Arabic', icon: 'language' },
    { value: 'ru', label: 'Russian', icon: 'language' }
  ];

  constructor(private fb: FormBuilder) {
    this.locationForm = this.fb.group({
      countries: [[]],
      languages: [[]]
    });
  }
}

// ============================================
// EXAMPLE 6: Disabled Options
// ============================================

@Component({
  selector: 'app-disabled-options-multiselect',
  standalone: true,
  imports: [AppMultiselect, ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <app-multiselect
        label="Select Features"
        formControlName="features"
        placeholder="Choose features"
        [options]="featureOptions"
        [searchable]="true"
        hint="Some features require premium subscription"
      >
      </app-multiselect>
    </form>
  `
})
export class DisabledOptionsMultiselectExample {
  form: FormGroup;

  featureOptions: MultiselectOption[] = [
    { value: 'basic', label: 'Basic Dashboard', icon: 'dashboard', disabled: false },
    { value: 'analytics', label: 'Analytics', icon: 'analytics', disabled: false },
    { value: 'advanced', label: 'Advanced Reports', icon: 'assessment', disabled: true, description: 'Premium only' },
    { value: 'export', label: 'Data Export', icon: 'download', disabled: false },
    { value: 'api', label: 'API Access', icon: 'api', disabled: true, description: 'Premium only' },
    { value: 'collaboration', label: 'Team Collaboration', icon: 'group', disabled: false },
    { value: 'automation', label: 'Automation', icon: 'sync', disabled: true, description: 'Premium only' }
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      features: [[]]
    });
  }
}

// ============================================
// EXPORT ALL EXAMPLES
// ============================================

export const APP_MULTISELECT_EXAMPLES = {
  BasicMultiselectExample,
  TeamSelectionExample,
  FilterMultiselectExample,
  PermissionMultiselectExample,
  LocationMultiselectExample,
  DisabledOptionsMultiselectExample
};
