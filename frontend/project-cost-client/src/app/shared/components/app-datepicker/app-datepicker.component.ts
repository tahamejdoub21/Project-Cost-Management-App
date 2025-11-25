import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  OnInit,
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

export type DatePickerView = 'day' | 'month' | 'year';

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
export class AppDatepickerComponent implements ControlValueAccessor, OnInit {
  @Input() label: string = '';
  @Input() placeholder: string = 'Select date';
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() minDate?: Date;
  @Input() maxDate?: Date;
  @Input() startView: DatePickerView = 'day';
  @Input() hint: string = '';
  @Input() errorMessage: string = '';

  @Output() dateChange = new EventEmitter<Date | null>();
  @Output() viewChange = new EventEmitter<DatePickerView>();

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

  ngOnInit(): void {
    this.currentView.set(this.startView);
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
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  // Actions
  togglePicker(): void {
    if (!this.disabled) {
      this.isOpen.update((open) => !open);
      if (this.isOpen()) {
        this.currentView.set('day');
      }
    }
  }

  selectDay(calendarDay: CalendarDay): void {
    if (!calendarDay.isDisabled) {
      this.selectedDate.set(calendarDay.date);
      this.displayDate.set(calendarDay.date);
      this.onChange(calendarDay.date);
      this.dateChange.emit(calendarDay.date);
      this.isOpen.set(false);
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

  onFocus(): void {
    this.isFocused.set(true);
  }

  onBlur(): void {
    this.isFocused.set(false);
    this.onTouched();
  }

  clear(): void {
    this.selectedDate.set(null);
    this.onChange(null);
    this.dateChange.emit(null);
    this.isOpen.set(false);
  }
}
