import { Component, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ButtonHierarchy = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'link';
export type ButtonState = 'default' | 'hover' | 'active' | 'disabled' | 'loading';
export type ButtonIconPosition = 'left' | 'right' | 'only';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-button.component.html',
  styleUrl: './app-button.component.scss'
})
export class AppButtonComponent {
  @Input() size: ButtonSize = 'md';
  @Input() hierarchy: ButtonHierarchy = 'primary';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() destructive: boolean = false;
  @Input() icon?: string;
  @Input() iconPosition: ButtonIconPosition = 'left';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() fullWidth: boolean = false;

  @Output() clicked = new EventEmitter<MouseEvent>();

  @HostBinding('class') get hostClasses(): string {
    const classes = [
      'app-button-host',
      this.fullWidth ? 'full-width' : ''
    ];
    return classes.filter(c => c).join(' ');
  }

  get buttonClasses(): string {
    const classes = [
      'app-button',
      `app-button--${this.size}`,
      `app-button--${this.hierarchy}`,
      this.destructive ? 'app-button--destructive' : '',
      this.loading ? 'app-button--loading' : '',
      this.disabled ? 'app-button--disabled' : '',
      this.iconOnly ? 'app-button--icon-only' : '',
      this.fullWidth ? 'app-button--full-width' : ''
    ];
    return classes.filter(c => c).join(' ');
  }

  get iconOnly(): boolean {
    return this.iconPosition === 'only' && !!this.icon;
  }

  get showLeftIcon(): boolean {
    return !!this.icon && (this.iconPosition === 'left' || this.iconPosition === 'only');
  }

  get showRightIcon(): boolean {
    return !!this.icon && this.iconPosition === 'right';
  }

  handleClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }
}
