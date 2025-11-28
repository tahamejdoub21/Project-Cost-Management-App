import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

export type SwitchSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-switch',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-switch.html',
  styleUrl: './app-switch.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppSwitch),
      multi: true
    }
  ]
})
export class AppSwitch implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() description: string = '';
  @Input() errorMessage: string = '';
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() size: SwitchSize = 'md';
  @Input() labelPosition: 'left' | 'right' = 'right';

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

  onSwitchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.checked = input.checked;
    this.onChange(this.checked);
    this.onTouched();
  }

  toggleSwitch(): void {
    if (!this.disabled) {
      this.checked = !this.checked;
      this.onChange(this.checked);
      this.onTouched();
    }
  }
}
