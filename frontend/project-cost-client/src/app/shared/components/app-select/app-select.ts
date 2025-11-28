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

export interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
  icon?: string;
  description?: string;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './app-select.html',
  styleUrl: './app-select.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppSelect),
      multi: true
    }
  ]
})
export class AppSelect implements ControlValueAccessor, OnDestroy {
  @ViewChild('selectElement') selectElement!: ElementRef<HTMLDivElement>;

  // ============================================
  // INPUTS
  // ============================================
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() label: string = '';
  @Input() placeholder: string = 'Select';
  @Input() options: SelectOption[] = [];
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

  // ============================================
  // OUTPUTS
  // ============================================
  @Output() valueChange = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<SelectOption | null>();

  // ============================================
  // INTERNAL STATE
  // ============================================
  value = signal<any>(null);
  isOpen = signal<boolean>(false);
  isFocused = signal<boolean>(false);
  searchQuery = signal<string>('');
  private overlayId: string = '';

  // Computed values
  selectedOption = computed(() => {
    const val = this.value();
    return this.options.find(opt => opt.value === val) || null;
  });

  displayText = computed(() => {
    const selected = this.selectedOption();
    return selected ? selected.label : this.placeholder;
  });

  filteredOptions = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query || !this.searchable) return this.options;
    return this.options.filter(opt =>
      opt.label.toLowerCase().includes(query) ||
      opt.description?.toLowerCase().includes(query)
    );
  });

  hasValue = computed(() => this.value() !== null && this.value() !== undefined);

  showClearButton = computed(() => this.clearable && this.hasValue() && !this.disabled && !this.readonly);

  // Control Value Accessor
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private overlayManager: OverlayManagerService) {
    // Auto-generate ID if not provided
    effect(() => {
      if (!this.id) {
        this.id = `app-select-${Math.random().toString(36).substring(2, 9)}`;
      }
    });

    this.overlayId = `select-dropdown-${Math.random().toString(36).substring(2, 11)}`;
  }

  ngOnDestroy(): void {
    this.overlayManager.unregister(this.overlayId);
  }

  // ============================================
  // CONTROL VALUE ACCESSOR METHODS
  // ============================================
  writeValue(value: any): void {
    this.value.set(value);
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

  selectOption(option: SelectOption): void {
    if (option.disabled) return;

    this.value.set(option.value);
    this.onChange(option.value);
    this.valueChange.emit(option.value);
    this.selectionChange.emit(option);
    this.closeDropdown();
    this.onTouched();
  }

  clearSelection(event: Event): void {
    event.stopPropagation();
    this.value.set(null);
    this.onChange(null);
    this.valueChange.emit(null);
    this.selectionChange.emit(null);
    this.onTouched();
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  onBlur(): void {
    setTimeout(() => {
      this.closeDropdown();
    }, 200);
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
    this.value.set(null);
    this.onChange(null);
    this.searchQuery.set('');
  }
}
