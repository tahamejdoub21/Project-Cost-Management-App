import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  ViewChild,
  ElementRef,
  signal,
  computed,
  effect,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OverlayManagerService } from '../../services/overlay-manager.service';

export interface MultiselectOption {
  label: string;
  value: any;
  disabled?: boolean;
  icon?: string;
  description?: string;
}

@Component({
  selector: 'app-multiselect',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './app-multiselect.html',
  styleUrl: './app-multiselect.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppMultiselect),
      multi: true
    }
  ]
})
export class AppMultiselect implements ControlValueAccessor, OnDestroy {
  @ViewChild('selectElement') selectElement!: ElementRef<HTMLDivElement>;

  // ============================================
  // INPUTS
  // ============================================
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() label: string = '';
  @Input() placeholder: string = 'Select options';
  @Input() options: MultiselectOption[] = [];
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() loading: boolean = false;
  @Input() searchable: boolean = false;
  @Input() clearable: boolean = false;
  @Input() hint: string = '';
  @Input() errorMessage: string = '';
  @Input() successMessage: string = '';
  @Input() tooltipText: string = '';
  @Input() class: string = '';
  @Input() width: string = '';
  @Input() maxHeight: string = '300px';
  @Input() showSelectAll: boolean = true;

  // ============================================
  // OUTPUTS
  // ============================================
  @Output() valueChange = new EventEmitter<any[]>();
  @Output() selectionChange = new EventEmitter<MultiselectOption[]>();

  // ============================================
  // INTERNAL STATE
  // ============================================
  value = signal<any[]>([]);
  isOpen = signal<boolean>(false);
  isFocused = signal<boolean>(false);
  searchQuery = signal<string>('');
  private overlayId: string = '';

  // Computed values
  selectedOptions = computed(() => {
    const vals = this.value();
    return this.options.filter(opt => vals.includes(opt.value));
  });

  displayText = computed(() => {
    const selected = this.selectedOptions();
    if (selected.length === 0) return this.placeholder;
    if (selected.length === 1) return selected[0].label;
    return `${selected.length} items selected`;
  });

  filteredOptions = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query || !this.searchable) return this.options;
    return this.options.filter(opt =>
      opt.label.toLowerCase().includes(query) ||
      opt.description?.toLowerCase().includes(query)
    );
  });

  hasValue = computed(() => this.value().length > 0);

  showClearButton = computed(() => this.clearable && this.hasValue() && !this.disabled && !this.readonly);

  allSelected = computed(() => {
    const filtered = this.filteredOptions();
    const selected = this.value();
    return filtered.length > 0 && filtered.every(opt => !opt.disabled && selected.includes(opt.value));
  });

  someSelected = computed(() => {
    const filtered = this.filteredOptions();
    const selected = this.value();
    return filtered.some(opt => selected.includes(opt.value)) && !this.allSelected();
  });

  // Control Value Accessor
  private onChange: (value: any[]) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private overlayManager: OverlayManagerService) {
    // Auto-generate ID if not provided
    effect(() => {
      if (!this.id) {
        this.id = `app-multiselect-${Math.random().toString(36).substring(2, 9)}`;
      }
    });

    this.overlayId = `multiselect-dropdown-${Math.random().toString(36).substring(2, 11)}`;
  }

  ngOnDestroy(): void {
    this.overlayManager.unregister(this.overlayId);
  }

  // ============================================
  // CONTROL VALUE ACCESSOR METHODS
  // ============================================
  writeValue(value: any[]): void {
    this.value.set(Array.isArray(value) ? value : []);
  }

  registerOnChange(fn: (value: any[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================
  toggleDropdown(): void {
    if (this.disabled || this.readonly) return;

    const willOpen = !this.isOpen();

    if (willOpen) {
      this.overlayManager.register({
        id: this.overlayId,
        type: 'dropdown',
        close: () => this.closeDropdown()
      });
      this.isOpen.set(true);
      this.isFocused.set(true);
    } else {
      this.closeDropdown();
    }
  }

  private closeDropdown(): void {
    this.isOpen.set(false);
    this.isFocused.set(false);
    this.searchQuery.set('');
    this.overlayManager.unregister(this.overlayId);
  }

  toggleOption(option: MultiselectOption, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (option.disabled) return;

    const currentValue = this.value();
    const index = currentValue.indexOf(option.value);
    let newValue: any[];

    if (index === -1) {
      // Add to selection
      newValue = [...currentValue, option.value];
    } else {
      // Remove from selection
      newValue = currentValue.filter(v => v !== option.value);
    }

    this.updateValue(newValue);
  }

  toggleSelectAll(event: Event): void {
    event.stopPropagation();

    const filtered = this.filteredOptions();
    const enabledOptions = filtered.filter(opt => !opt.disabled);

    if (this.allSelected()) {
      // Deselect all filtered options
      const valuesToRemove = enabledOptions.map(opt => opt.value);
      const newValue = this.value().filter(v => !valuesToRemove.includes(v));
      this.updateValue(newValue);
    } else {
      // Select all filtered options
      const currentValue = this.value();
      const valuesToAdd = enabledOptions
        .map(opt => opt.value)
        .filter(v => !currentValue.includes(v));
      this.updateValue([...currentValue, ...valuesToAdd]);
    }
  }

  private updateValue(newValue: any[]): void {
    this.value.set(newValue);
    this.onChange(newValue);
    this.valueChange.emit(newValue);

    const selected = this.options.filter(opt => newValue.includes(opt.value));
    this.selectionChange.emit(selected);
    this.onTouched();
  }

  clearSelection(event: Event): void {
    event.stopPropagation();
    this.updateValue([]);
  }

  onSearchInput(event: Event): void {
    event.stopPropagation();
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  isSelected(option: MultiselectOption): boolean {
    return this.value().includes(option.value);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeDropdown();
    }
  }

  preventClose(event: Event): void {
    event.stopPropagation();
  }

  // ============================================
  // HELPER METHODS
  // ============================================
  getErrorMessage(): string {
    return this.errorMessage;
  }

  focus(): void {
    if (this.selectElement) {
      this.selectElement.nativeElement.focus();
    }
  }

  reset(): void {
    this.updateValue([]);
    this.searchQuery.set('');
  }

  removeTag(value: any, event: Event): void {
    event.stopPropagation();
    const newValue = this.value().filter(v => v !== value);
    this.updateValue(newValue);
  }
}
