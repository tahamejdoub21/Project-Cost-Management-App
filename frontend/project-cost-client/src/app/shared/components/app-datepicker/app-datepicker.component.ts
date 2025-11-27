import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  OnInit,
  OnDestroy,
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
import { MatButtonModule } from '@angular/material/button';
import { OverlayManagerService } from '../../services/overlay-manager.service';

export type DatePickerView = 'day' | 'month' | 'year';
export type DateFormat = 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy-MM-dd' | 'dd/MM/yy' | 'MM/dd/yy';

interface CalendarDay {
  date: Date;
  day: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
}

@Component({
  selector: 'app-datepicker',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './app-datepicker.component.html',
  styleUrls: ['./app-datepicker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppDatepickerComponent),
      multi: true,
    },
  ],
})
export class AppDatepickerComponent implements ControlValueAccessor, OnInit, OnDestroy {
  // ============================================
  // BASIC IDENTIFICATION & APPEARANCE
  // ============================================
  @Input() label: string = '';
  @Input() placeholder: string = 'dd/MM/yy';
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() readonly: boolean = false;
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() class: string = '';

  // ============================================
  // DATE CONFIGURATION
  // ============================================
  @Input() format: DateFormat = 'dd/MM/yy';
  @Input() minDate?: Date;
  @Input() maxDate?: Date;
  @Input() startView: DatePickerView = 'day';
  @Input() defaultValue?: Date;
  @Input() clearable: boolean = true;

  // ============================================
  // VALIDATION & MESSAGES
  // ============================================
  @Input() hint: string = '';
  @Input() errorMessage: string = '';
  @Input() successMessage: string = '';

  // ============================================
  // ACCESSIBILITY
  // ============================================
  @Input() ariaLabel: string = '';
  @Input() ariaDescribedBy: string = '';
  @Input() ariaLabelledBy: string = '';

  // ============================================
  // BEHAVIOR
  // ============================================
  @Input() autoClose: boolean = true;
  @Input() showWeekNumbers: boolean = false;
  @Input() highlightToday: boolean = true;

  // ============================================
  // STYLING
  // ============================================
  @Input() width?: string;
  @Input() variant: 'outline' | 'fill' = 'outline';

  // ============================================
  // OUTPUTS (EVENTS)
  // ============================================
  @Output() dateChange = new EventEmitter<Date | null>();
  @Output() viewChange = new EventEmitter<DatePickerView>();
  @Output() openChange = new EventEmitter<boolean>();
  @Output() focusEvent = new EventEmitter<FocusEvent>();
  @Output() blurEvent = new EventEmitter<FocusEvent>();

  // Signals
  selectedDate = signal<Date | null>(null);
  displayDate = signal<Date>(new Date());
  currentView = signal<DatePickerView>('day');
  isOpen = signal<boolean>(false);
  isFocused = signal<boolean>(false);

  // Computed values
  formattedDate = computed(() => {
    const date = this.selectedDate();
    if (!date) return '';
    return this.formatDate(date);
  });

  displayMonth = computed(() => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[this.displayDate().getMonth()];
  });

  displayYear = computed(() => this.displayDate().getFullYear());

  calendarDays = computed(() => this.generateCalendarDays());
  monthOptions = computed(() => this.generateMonthOptions());
  yearOptions = computed(() => this.generateYearOptions());

  weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  private onChange: (value: Date | null) => void = () => {};
  private onTouched: () => void = () => {};
  private overlayId: string = '';

  constructor(private overlayManager: OverlayManagerService) {
    this.overlayId = `datepicker-${Math.random().toString(36).substring(2, 11)}`;

    // Auto-generate ID if not provided
    if (!this.id) {
      this.id = `app-datepicker-${Math.random().toString(36).substring(2, 9)}`;
    }
  }

  ngOnInit(): void {
    this.currentView.set(this.startView);

    // Set default value if provided
    if (this.defaultValue && !this.selectedDate()) {
      this.selectedDate.set(this.defaultValue);
      this.displayDate.set(this.defaultValue);
    }
  }

  ngOnDestroy(): void {
    // Unregister overlay when component is destroyed
    this.overlayManager.unregister(this.overlayId);
  }

  // ControlValueAccessor methods
  writeValue(value: Date | null): void {
    if (value) {
      this.selectedDate.set(new Date(value));
      this.displayDate.set(new Date(value));
    } else {
      this.selectedDate.set(null);
    }
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Calendar generation
  private generateCalendarDays(): CalendarDay[] {
    const days: CalendarDay[] = [];
    const displayDate = this.displayDate();
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();

    // Get first day of month (0 = Sunday, 1 = Monday, etc.)
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Adjust first day to Monday (0) instead of Sunday (0)
    let startDay = firstDay.getDay() - 1;
    if (startDay === -1) startDay = 6;

    // Add previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(year, month - 1, day);
      days.push(this.createCalendarDay(date, false));
    }

    // Add current month's days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push(this.createCalendarDay(date, true));
    }

    // Add next month's days to complete the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push(this.createCalendarDay(date, false));
    }

    return days;
  }

  private createCalendarDay(date: Date, isCurrentMonth: boolean): CalendarDay {
    const today = new Date();
    const selected = this.selectedDate();

    return {
      date,
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      isCurrentMonth,
      isToday: this.isSameDay(date, today),
      isSelected: selected ? this.isSameDay(date, selected) : false,
      isDisabled: this.isDateDisabled(date),
    };
  }

  private generateMonthOptions(): { value: number; label: string; selected: boolean }[] {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const currentMonth = this.displayDate().getMonth();

    return months.map((label, index) => ({
      value: index,
      label,
      selected: index === currentMonth,
    }));
  }

  private generateYearOptions(): { value: number; label: string; selected: boolean }[] {
    const currentYear = this.displayDate().getFullYear();
    const startYear = currentYear - 50;
    const endYear = currentYear + 50;
    const years: { value: number; label: string; selected: boolean }[] = [];

    for (let year = endYear; year >= startYear; year--) {
      years.push({
        value: year,
        label: year.toString(),
        selected: year === currentYear,
      });
    }

    return years;
  }

  // Date helpers
  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  private isDateDisabled(date: Date): boolean {
    if (this.minDate && date < this.minDate) return true;
    if (this.maxDate && date > this.maxDate) return true;
    return false;
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const fullYear = date.getFullYear();
    const shortYear = String(fullYear).slice(-2);

    switch (this.format) {
      case 'dd/MM/yy':
        return `${day}/${month}/${shortYear}`;
      case 'dd/MM/yyyy':
        return `${day}/${month}/${fullYear}`;
      case 'MM/dd/yyyy':
        return `${month}/${day}/${fullYear}`;
      case 'MM/dd/yy':
        return `${month}/${day}/${shortYear}`;
      case 'yyyy-MM-dd':
        return `${fullYear}-${month}-${day}`;
      default:
        return `${day}/${month}/${shortYear}`;
    }
  }

  // Actions
  togglePicker(): void {
    if (!this.disabled && !this.readonly) {
      const willOpen = !this.isOpen();

      if (willOpen) {
        // Register with overlay manager before opening
        this.overlayManager.register({
          id: this.overlayId,
          type: 'calendar',
          close: () => this.closePicker()
        });
        this.isOpen.set(true);
        this.currentView.set('day');
        this.openChange.emit(true);
      } else {
        this.closePicker();
      }
    }
  }

  private closePicker(): void {
    this.isOpen.set(false);
    this.overlayManager.unregister(this.overlayId);
    this.openChange.emit(false);
  }

  selectDay(calendarDay: CalendarDay): void {
    if (!calendarDay.isDisabled) {
      this.selectedDate.set(calendarDay.date);
      this.displayDate.set(calendarDay.date);
      this.onChange(calendarDay.date);
      this.dateChange.emit(calendarDay.date);

      // Auto-close if enabled
      if (this.autoClose) {
        this.closePicker();
      }
      this.onTouched();
    }
  }

  selectMonth(month: number): void {
    const newDate = new Date(this.displayDate());
    newDate.setMonth(month);
    this.displayDate.set(newDate);
    this.currentView.set('day');
  }

  selectYear(year: number): void {
    const newDate = new Date(this.displayDate());
    newDate.setFullYear(year);
    this.displayDate.set(newDate);
    this.currentView.set('month');
  }

  previousMonth(): void {
    const newDate = new Date(this.displayDate());
    newDate.setMonth(newDate.getMonth() - 1);
    this.displayDate.set(newDate);
  }

  nextMonth(): void {
    const newDate = new Date(this.displayDate());
    newDate.setMonth(newDate.getMonth() + 1);
    this.displayDate.set(newDate);
  }

  toggleMonthView(): void {
    this.currentView.set(this.currentView() === 'month' ? 'day' : 'month');
    this.viewChange.emit(this.currentView());
  }

  toggleYearView(): void {
    this.currentView.set(this.currentView() === 'year' ? 'month' : 'year');
    this.viewChange.emit(this.currentView());
  }

  onFocus(event?: FocusEvent): void {
    this.isFocused.set(true);
    if (event) {
      this.focusEvent.emit(event);
    }
  }

  onBlur(event?: FocusEvent): void {
    setTimeout(() => {
      this.isFocused.set(false);
      this.closePicker();
    }, 200);
    this.onTouched();
    if (event) {
      this.blurEvent.emit(event);
    }
  }

  clear(): void {
    this.selectedDate.set(null);
    this.onChange(null);
    this.dateChange.emit(null);
    this.closePicker();
  }
}
