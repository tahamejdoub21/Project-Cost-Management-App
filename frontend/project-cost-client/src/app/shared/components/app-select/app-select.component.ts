import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
  group?: string;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
  ],
  templateUrl: './app-select.component.html',
  styleUrls: ['./app-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppSelectComponent),
      multi: true,
    },
  ],
})
export class AppSelectComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = 'Select an option';
  @Input() options: SelectOption[] = [];
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() searchable: boolean = false;
  @Input() clearable: boolean = false;
  @Input() multiple: boolean = false;
  @Input() hint: string = '';
  @Input() errorMessage: string = '';

  @Output() selectionChange = new EventEmitter<any>();
  @Output() openChange = new EventEmitter<boolean>();

  // Signals
  selectedValue = signal<any>(null);
  isOpen = signal<boolean>(false);
  isFocused = signal<boolean>(false);
  searchQuery = signal<string>('');

  // Computed values
  selectedOption = computed((): SelectOption | SelectOption[] | undefined => {
    const value = this.selectedValue();
    if (this.multiple && Array.isArray(value)) {
      return this.options.filter(opt => value.includes(opt.value));
    }
    return this.options.find(opt => opt.value === value);
  });

  displayText = computed(() => {
    const selected = this.selectedOption();
    if (!selected) return '';

    if (Array.isArray(selected)) {
      if (selected.length === 0) return '';
      if (selected.length === 1) return selected[0].label;
      return `${selected.length} selected`;
    }

    return selected.label || '';
  });

  filteredOptions = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.options;

    return this.options.filter(option =>
      option.label.toLowerCase().includes(query) ||
      (option.value?.toString().toLowerCase().includes(query))
    );
  });

  groupedOptions = computed(() => {
    const filtered = this.filteredOptions();
    const groups = new Map<string, SelectOption[]>();

    filtered.forEach(option => {
      const group = option.group || '_default';
      if (!groups.has(group)) {
        groups.set(group, []);
      }
      groups.get(group)!.push(option);
    });

    return groups;
  });

  hasGroups = computed(() => {
    return this.options.some(opt => opt.group);
  });

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this.selectedValue.set(value);
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Actions
  toggle(): void {
    if (!this.disabled) {
      this.isOpen.update(open => !open);
      this.openChange.emit(this.isOpen());

      if (!this.isOpen()) {
        this.searchQuery.set('');
        this.onTouched();
      }
    }
  }

  selectOption(option: SelectOption): void {
    if (option.disabled) return;

    if (this.multiple) {
      const currentValue = Array.isArray(this.selectedValue())
        ? [...this.selectedValue()]
        : [];

      const index = currentValue.indexOf(option.value);
      if (index > -1) {
        currentValue.splice(index, 1);
      } else {
        currentValue.push(option.value);
      }

      this.selectedValue.set(currentValue);
      this.onChange(currentValue);
      this.selectionChange.emit(currentValue);
    } else {
      this.selectedValue.set(option.value);
      this.onChange(option.value);
      this.selectionChange.emit(option.value);
      this.isOpen.set(false);
      this.searchQuery.set('');
      this.onTouched();
    }
  }

  isSelected(option: SelectOption): boolean {
    const value = this.selectedValue();
    if (this.multiple && Array.isArray(value)) {
      return value.includes(option.value);
    }
    return value === option.value;
  }

  clear(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    const newValue = this.multiple ? [] : null;
    this.selectedValue.set(newValue);
    this.onChange(newValue);
    this.selectionChange.emit(newValue);
    this.isOpen.set(false);
    this.searchQuery.set('');
  }

  onFocus(): void {
    this.isFocused.set(true);
  }

  onBlur(): void {
    setTimeout(() => {
      this.isFocused.set(false);
      this.isOpen.set(false);
      this.searchQuery.set('');
    }, 200);
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}
