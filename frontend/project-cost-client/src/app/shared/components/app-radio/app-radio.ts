import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

export type RadioSize = 'sm' | 'md' | 'lg';

export interface RadioOption {
  value: string | number;
  label: string;
  description?: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-radio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-radio.html',
  styleUrl: './app-radio.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppRadio),
      multi: true
    }
  ]
})
export class AppRadio implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() name: string = `radio-${Math.random().toString(36).substring(7)}`;
  @Input() options: RadioOption[] = [];
  @Input() errorMessage: string = '';
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() size: RadioSize = 'md';
  @Input() orientation: 'vertical' | 'horizontal' = 'vertical';

  selectedValue: string | number | null = null;
  private onChange: (value: string | number | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | number | null): void {
    this.selectedValue = value;
  }

  registerOnChange(fn: (value: string | number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onRadioChange(value: string | number): void {
    if (!this.disabled) {
      this.selectedValue = value;
      this.onChange(value);
      this.onTouched();
    }
  }

  isSelected(value: string | number): boolean {
    return this.selectedValue === value;
  }

  isOptionDisabled(option: RadioOption): boolean {
    return this.disabled || !!option.disabled;
  }
}
