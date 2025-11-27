import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  signal,
  computed,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  FormsModule,
  ValidationErrors
} from '@angular/forms';
import { MatFormFieldModule, FloatLabelType } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule, MatDatepicker, MatDatepickerInput } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { OverlayManagerService } from '../../services/overlay-manager.service';

export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'search'
  | 'tel'
  | 'url'
  | 'date'
  | 'datetime-local'
  | 'time'
  | 'month'
  | 'week'
  | 'color';

export type InputVariant = 'fill' | 'outline' | 'standard';

export type InputMode =
  | 'none'
  | 'text'
  | 'decimal'
  | 'numeric'
  | 'tel'
  | 'search'
  | 'email'
  | 'url';

export type EnterKeyHint =
  | 'enter'
  | 'done'
  | 'go'
  | 'next'
  | 'previous'
  | 'search'
  | 'send';

export type AutoCapitalize = 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters';

export type TextDirection = 'ltr' | 'rtl' | 'auto';

export type IconType = 'material' | 'fontawesome' | 'custom';

export interface IconConfig {
  name: string;
  type?: IconType;
  color?: string;
  clickable?: boolean;
  tooltip?: string;
}

export type ValidationMessageKey =
  | 'required'
  | 'email'
  | 'minlength'
  | 'maxlength'
  | 'min'
  | 'max'
  | 'pattern'
  | string;

// Add phone number interfaces
export interface CountryCode {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

export interface PhoneNumber {
  countryCode: string;
  number: string;
  fullNumber: string;
}

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule
  ],
  templateUrl: './app-input.component.html',
  styleUrls: ['./app-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppInputComponent),
      multi: true
    }
  ]
})
export class AppInputComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @ViewChild('inputElement') inputElement!: ElementRef<HTMLInputElement>;
  @ViewChild('phoneInputElement') phoneInputElement!: ElementRef<HTMLInputElement>;
  @ViewChild('myDatepicker', { static: false }) myDatepicker?: MatDatepicker<Date>;

  // Unique ID for datepicker
  datepickerId: string = '';

  // ============================================
  // BASIC IDENTIFICATION
  // ============================================
  @Input() type: InputType = 'text';
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() label: string = '';
  @Input() placeholder: string = '';

  // ============================================
  // PHONE NUMBER SPECIFIC INPUTS
  // ============================================
  @Input() enablePhoneFormat: boolean = false;
  @Input() defaultCountry: string = 'US';
  @Input() availableCountries: CountryCode[] = [
    { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
    { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
    { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
    { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
    { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
    { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' }
  ];

  // ============================================
  // STYLING & VARIANTS
  // ============================================
  @Input() variant: InputVariant = 'outline';
  @Input() class: string = '';
  @Input() dataTheme: string = '';

  // ============================================
  // USER EXPERIENCE & BEHAVIOR
  // ============================================
  @Input() autocomplete: string = 'off';
  @Input() autofocus: boolean = false;
  @Input() readonly: boolean = false;
  @Input() disabled: boolean = false;
  @Input() spellcheck: boolean = false;
  @Input() loading: boolean = false;

  // ============================================
  // VALIDATION & CONSTRAINTS
  // ============================================
  @Input() required: boolean = false;
  @Input() minlength?: number;
  @Input() maxlength?: number;
  @Input() pattern?: string;
  @Input() min?: number | string;
  @Input() max?: number | string;
  @Input() step?: number | string;

  // ============================================
  // CUSTOM VALIDATION
  // ============================================
  @Input() customValidation: boolean = false;
  @Input() validationType: string = '';
  @Input() validationMessages: Record<ValidationMessageKey, string> = {};
  @Input() errorMessage: string = '';
  @Input() successMessage: string = '';
  @Input() hint: string = '';

  // ============================================
  // ACCESSIBILITY
  // ============================================
  @Input() ariaLabel: string = '';
  @Input() ariaDescribedBy: string = '';
  @Input() ariaLabelledBy: string = '';
  @Input() ariaInvalid: boolean = false;
  @Input() ariaRequired: boolean = false;

  // ============================================
  // ICONS
  // ============================================
  @Input() iconLeft?: IconConfig;
  @Input() iconRight?: IconConfig;
  @Input() clearable: boolean = false;
  @Input() showPasswordToggle: boolean = false;

  // ============================================
  // MOBILE & KEYBOARD
  // ============================================
  @Input() inputmode?: InputMode;
  @Input() enterkeyhint?: EnterKeyHint;
  @Input() autocapitalize: AutoCapitalize = 'off';
  @Input() autocorrect: boolean = false;
  @Input() dir: TextDirection = 'ltr';

  // ============================================
  // ADVANCED BEHAVIOR
  // ============================================
  @Input() debounceTime: number = 0;
  @Input() trim: boolean = false;
  @Input() uppercase: boolean = false;
  @Input() lowercase: boolean = false;
  @Input() defaultValue: string = '';
  @Input() locale: string = '';

  // ============================================
  // SIZE & APPEARANCE
  // ============================================
  @Input() size?: number;
  @Input() width?: string;
  @Input() height?: string;
  @Input() floatLabel: FloatLabelType = 'auto';

  // ============================================
  // COUNTER
  // ============================================
  @Input() showCounter: boolean = false;

  // ============================================
  // OUTPUTS (EVENTS)
  // ============================================
  @Output() valueChange = new EventEmitter<string>();
  @Output() inputEvent = new EventEmitter<Event>();
  @Output() changeEvent = new EventEmitter<Event>();
  @Output() focusEvent = new EventEmitter<FocusEvent>();
  @Output() blurEvent = new EventEmitter<FocusEvent>();
  @Output() keydownEvent = new EventEmitter<KeyboardEvent>();
  @Output() keyupEvent = new EventEmitter<KeyboardEvent>();
  @Output() clickEvent = new EventEmitter<MouseEvent>();
  @Output() leftIconClick = new EventEmitter<MouseEvent>();
  @Output() rightIconClick = new EventEmitter<MouseEvent>();
  @Output() clearClick = new EventEmitter<void>();
  @Output() countryChange = new EventEmitter<CountryCode>();

  // ============================================
  // INTERNAL STATE
  // ============================================
  value = signal<string>('');
  isFocused = signal<boolean>(false);
  isTouched = signal<boolean>(false);
  passwordVisible = signal<boolean>(false);
  currentError = signal<string>('');
  previousValue = signal<string>('');

  // Phone number specific signals
  selectedCountry = signal<CountryCode>(this.availableCountries[0]);
  isCountryDropdownOpen = signal<boolean>(false);
  phoneSearchQuery = signal<string>('');

  // Computed values
  hasValue = computed(() => this.value() !== '');
  showClearButton = computed(() => this.clearable && this.hasValue() && !this.disabled);
  currentType = computed(() =>
    this.type === 'password' && this.showPasswordToggle && this.passwordVisible()
      ? 'text'
      : this.type
  );
  characterCount = computed(() => this.value().length);
  appearance = computed(() => {
    if (this.variant === 'outline') return 'outline';
    if (this.variant === 'fill') return 'fill';
    return 'outline';
  });

  // Phone number computed values
  filteredCountries = computed(() => {
    const query = this.phoneSearchQuery().toLowerCase();
    if (!query) return this.availableCountries;
    return this.availableCountries.filter(country => 
      country.name.toLowerCase().includes(query) ||
      country.dialCode.includes(query) ||
      country.code.toLowerCase().includes(query)
    );
  });

  formattedPhoneNumber = computed(() => {
    if (this.type !== 'tel' || !this.enablePhoneFormat) return this.value();
    return this.formatPhoneNumber(this.value());
  });

  // Control Value Accessor
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  // Debounce subject
  private inputSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  private phoneDropdownOverlayId: string = '';
  private datepickerOverlayId: string = '';

  constructor(
    private cdr: ChangeDetectorRef,
    private overlayManager: OverlayManagerService
  ) {
    // Auto-generate ID if not provided
    effect(() => {
      if (!this.id) {
        this.id = `app-input-${Math.random().toString(36).substring(2, 9)}`;
      }
    });

    // Set default country
    effect(() => {
      const defaultCountry = this.availableCountries.find(c => c.code === this.defaultCountry);
      if (defaultCountry) {
        this.selectedCountry.set(defaultCountry);
      }
    });

    // Generate unique overlay IDs
    this.datepickerId = `datepicker-${Math.random().toString(36).substring(2, 11)}`;
    this.phoneDropdownOverlayId = `phone-dropdown-${Math.random().toString(36).substring(2, 11)}`;
    this.datepickerOverlayId = `datepicker-overlay-${Math.random().toString(36).substring(2, 11)}`;
  }

  ngOnInit(): void {
    // Set default value
    if (this.defaultValue) {
      this.value.set(this.defaultValue);
    }

    // Setup debounced input if debounceTime is set
    if (this.debounceTime > 0) {
      this.inputSubject
        .pipe(debounceTime(this.debounceTime), takeUntil(this.destroy$))
        .subscribe((value) => {
          this.emitValue(value);
        });
    }

    // Auto-set ARIA attributes based on required
    if (this.required && !this.ariaRequired) {
      this.ariaRequired = true;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Unregister overlays when component is destroyed
    this.overlayManager.unregister(this.phoneDropdownOverlayId);
    this.overlayManager.unregister(this.datepickerOverlayId);
  }

  // ============================================
  // CONTROL VALUE ACCESSOR METHODS
  // ============================================
  writeValue(value: string): void {
    this.value.set(value || '');
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================
  onInput(event: Event): void {
    if (this.type === 'tel' && this.enablePhoneFormat) {
      this.onPhoneInput(event);
      return;
    }

    const target = event.target as HTMLInputElement;
    let value = target.value;

    // Apply transformations
    if (this.trim) {
      value = value.trim();
    }
    if (this.uppercase) {
      value = value.toUpperCase();
      target.value = value;
    }
    if (this.lowercase) {
      value = value.toLowerCase();
      target.value = value;
    }

    this.previousValue.set(this.value());
    this.value.set(value);

    // Emit based on debounce setting
    if (this.debounceTime > 0) {
      this.inputSubject.next(value);
    } else {
      this.emitValue(value);
    }

    this.inputEvent.emit(event);
  }

  onPhoneInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    let value = target.value.replace(/\D/g, '');
    
    // Apply transformations
    if (this.trim) value = value.trim();
    if (this.maxlength) value = value.slice(0, this.maxlength);
    
    // Format the display value
    const formattedValue = this.formatPhoneNumber(value);
    target.value = formattedValue;
    
    this.value.set(value);
    
    if (this.debounceTime > 0) {
      this.inputSubject.next(value);
    } else {
      this.updatePhoneValue();
    }
    
    this.inputEvent.emit(event);
  }

  onChange_Event(event: Event): void {
    this.changeEvent.emit(event);
  }

  onFocus(event: FocusEvent): void {
    this.isFocused.set(true);
    this.focusEvent.emit(event);
  }

  onBlur(event: FocusEvent): void {
    this.isFocused.set(false);
    this.isTouched.set(true);
    this.onTouched();
    this.blurEvent.emit(event);

    // Close country dropdown on blur
    setTimeout(() => {
      this.closeCountryDropdown();
    }, 200);
  }

  onKeyDown(event: KeyboardEvent): void {
    // Prevent non-numeric characters in number inputs
    if (this.type === 'number') {
      const allowedKeys = [
        'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
        'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        '.', '-'
      ];

      const isNumber = /^[0-9]$/.test(event.key);
      const isAllowedKey = allowedKeys.includes(event.key);
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;

      // Allow: Ctrl/Cmd + A, C, V, X, Z
      if (isCtrlOrCmd && ['a', 'c', 'v', 'x', 'z'].includes(event.key.toLowerCase())) {
        return;
      }

      // Block if not a number or allowed key
      if (!isNumber && !isAllowedKey) {
        event.preventDefault();
        return;
      }
    }

    this.keydownEvent.emit(event);
  }

  onKeyUp(event: KeyboardEvent): void {
    this.keyupEvent.emit(event);
  }

  onClick(event: MouseEvent): void {
    this.clickEvent.emit(event);
  }

  // ============================================
  // PHONE NUMBER METHODS
  // ============================================
  formatPhoneNumber(value: string): string {
    const numbers = value.replace(/\D/g, '');
    const country = this.selectedCountry();
    
    // US/Canada formatting
    if (country.dialCode === '+1') {
      if (numbers.length <= 3) return numbers;
      if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
    }
    
    // Generic formatting for other countries
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6, 10)}`;
  }

  selectCountry(country: CountryCode): void {
    this.selectedCountry.set(country);
    this.closeCountryDropdown();
    this.phoneSearchQuery.set('');
    this.updatePhoneValue();
    this.countryChange.emit(country);
  }

  updatePhoneValue(): void {
    const rawNumber = this.value().replace(/\D/g, '');
    const fullNumber = this.selectedCountry().dialCode + rawNumber;
    this.emitValue(fullNumber);
  }

  toggleCountryDropdown(): void {
    if (!this.disabled && !this.readonly) {
      const willOpen = !this.isCountryDropdownOpen();

      if (willOpen) {
        // Register with overlay manager before opening
        this.overlayManager.register({
          id: this.phoneDropdownOverlayId,
          type: 'dropdown',
          close: () => this.closeCountryDropdown()
        });
        this.isCountryDropdownOpen.set(true);
      } else {
        this.closeCountryDropdown();
      }
    }
  }

  private closeCountryDropdown(): void {
    this.isCountryDropdownOpen.set(false);
    this.overlayManager.unregister(this.phoneDropdownOverlayId);
  }

  // ============================================
  // ICON ACTIONS
  // ============================================
  onLeftIconClick(event: MouseEvent): void {
    if (this.iconLeft?.clickable) {
      this.leftIconClick.emit(event);
    }
  }

  onRightIconClick(event: MouseEvent): void {
    if (this.iconRight?.clickable) {
      this.rightIconClick.emit(event);
    }
  }

  onClearClick(): void {
    this.value.set('');
    this.emitValue('');
    this.clearClick.emit();
    this.inputElement?.nativeElement.focus();
  }

  togglePasswordVisibility(): void {
    this.passwordVisible.update((v) => !v);
  }

  // ============================================
  // HELPER METHODS
  // ============================================
  private emitValue(value: string): void {
    this.onChange(value);
    this.valueChange.emit(value);
  }

  focus(): void {
    if (this.type === 'tel' && this.enablePhoneFormat && this.phoneInputElement) {
      this.phoneInputElement.nativeElement.focus();
    } else if (this.inputElement) {
      this.inputElement.nativeElement.focus();
    }
  }

  blur(): void {
    if (this.type === 'tel' && this.enablePhoneFormat && this.phoneInputElement) {
      this.phoneInputElement.nativeElement.blur();
    } else if (this.inputElement) {
      this.inputElement.nativeElement.blur();
    }
  }

  reset(): void {
    this.value.set(this.defaultValue || '');
    this.emitValue(this.defaultValue || '');
    this.isTouched.set(false);
    this.currentError.set('');
  }

  getValue(): string {
    return this.value();
  }

  setValue(value: string): void {
    this.value.set(value);
    this.emitValue(value);
  }

  getState(): string {
    if (this.currentError()) return 'invalid';
    if (this.isFocused()) return 'focused';
    if (this.hasValue()) return 'valid';
    return 'empty';
  }

  // ============================================
  // VALIDATION HELPERS
  // ============================================
  setError(message: string): void {
    this.currentError.set(message);
    this.ariaInvalid = true;
  }

  clearError(): void {
    this.currentError.set('');
    this.ariaInvalid = false;
  }

  getErrorMessage(): string {
    if (this.currentError()) {
      return this.currentError();
    }
    if (this.errorMessage) {
      return this.errorMessage;
    }
    return '';
  }

  // Open datepicker programmatically
  openDatepicker(): void {
    if (this.myDatepicker && !this.disabled && !this.readonly) {
      // Register with overlay manager before opening
      this.overlayManager.register({
        id: this.datepickerOverlayId,
        type: 'calendar',
        close: () => this.closeDatepicker()
      });
      this.myDatepicker.open();
    }
  }

  private closeDatepicker(): void {
    if (this.myDatepicker) {
      this.myDatepicker.close();
      this.overlayManager.unregister(this.datepickerOverlayId);
    }
  }
}