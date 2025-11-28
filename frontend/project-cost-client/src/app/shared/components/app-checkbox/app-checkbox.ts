import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

export type CheckboxSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-checkbox.html',
  styleUrl: './app-checkbox.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppCheckbox),
      multi: true
    }
  ]
})
export class AppCheckbox implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() description: string = '';
  @Input() errorMessage: string = '';
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() size: CheckboxSize = 'md';
  @Input() indeterminate: boolean = false;

  checked: boolean = false;
  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: boolean): void {
    this.checked = value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onCheckboxChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.checked = input.checked;
    this.indeterminate = false;
    this.onChange(this.checked);
    this.onTouched();
  }

  onLabelClick(): void {
    if (!this.disabled) {
      this.checked = !this.checked;
      this.indeterminate = false;
      this.onChange(this.checked);
      this.onTouched();
    }
  }
}
