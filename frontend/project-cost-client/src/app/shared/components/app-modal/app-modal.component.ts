import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Subject, takeUntil } from 'rxjs';
import { ModalService, ActiveModal, AlertType } from '../../services/modal.service';
import { AppButtonComponent } from '../app-button/app-button.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, AppButtonComponent],
  templateUrl: './app-modal.component.html',
  styleUrl: './app-modal.component.scss',
  animations: [
    trigger('backdropAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0 }))
      ])
    ]),
    trigger('modalAnimation', [
      transition('* => dialog', [
        style({ opacity: 0, transform: 'scale(0.95) translateY(-10px)' }),
        animate('250ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ]),
      transition('* => alert', [
        style({ opacity: 0, transform: 'scale(0.95) translateY(-10px)' }),
        animate('250ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ]),
      transition('* => drawer-right', [
        style({ transform: 'translateX(100%)' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateX(0)' }))
      ]),
      transition('* => drawer-left', [
        style({ transform: 'translateX(-100%)' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class AppModalComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('modalContent') modalContent!: ElementRef<HTMLElement>;
  @ViewChild('firstFocusable') firstFocusable!: ElementRef<HTMLElement>;
  @ViewChild('lastFocusable') lastFocusable!: ElementRef<HTMLElement>;

  modals: ActiveModal[] = [];
  private destroy$ = new Subject<void>();
  private previousActiveElement: HTMLElement | null = null;
  loadingStates: Map<string, boolean> = new Map();

  constructor(public modalService: ModalService) {}

  ngOnInit(): void {
    this.modalService.modals$
      .pipe(takeUntil(this.destroy$))
      .subscribe(modals => {
        this.modals = modals;
      });
  }

  ngAfterViewInit(): void {
    // Store the previously focused element
    if (typeof document !== 'undefined') {
      this.previousActiveElement = document.activeElement as HTMLElement;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Restore focus to previously focused element
    if (this.previousActiveElement) {
      setTimeout(() => {
        this.previousActiveElement?.focus();
      }, 0);
    }
  }

  /**
   * Handle backdrop click
   */
  onBackdropClick(modal: ActiveModal, event: MouseEvent): void {
    if (modal.config.closeOnBackdropClick) {
      const target = event.target as HTMLElement;
      if (target.classList.contains('modal-backdrop')) {
        this.modalService.dismiss(modal.config.id, 'backdrop');
      }
    }
  }

  /**
   * Close modal
   */
  close(modal: ActiveModal): void {
    this.modalService.close(modal.config.id);
  }

  /**
   * Dismiss modal
   */
  dismiss(modal: ActiveModal): void {
    this.modalService.dismiss(modal.config.id, 'cancel');
  }

  /**
   * Handle confirm action
   */
  async handleConfirm(modal: ActiveModal): Promise<void> {
    if (modal.config.onConfirm) {
      this.loadingStates.set(modal.config.id, true);
      try {
        const result = modal.config.onConfirm();
        if (result instanceof Promise) {
          await result;
        }
      } finally {
        this.loadingStates.set(modal.config.id, false);
      }
    }
    this.modalService.close(modal.config.id, true);
  }

  /**
   * Check if modal is in loading state
   */
  isLoading(modalId: string): boolean {
    return this.loadingStates.get(modalId) || false;
  }

  /**
   * Handle cancel action
   */
  handleCancel(modal: ActiveModal): void {
    if (modal.config.onCancel) {
      modal.config.onCancel();
    }
    this.modalService.dismiss(modal.config.id, 'cancel');
  }

  /**
   * Get modal container classes
   */
  getModalClasses(modal: ActiveModal): string {
    const classes = [
      'modal-container',
      `modal-container--${modal.config.type}`,
      modal.config.size ? `modal-container--${modal.config.size}` : '',
      modal.config.customClass || ''
    ];
    return classes.filter(c => c).join(' ');
  }

  /**
   * Get alert icon based on type
   */
  getAlertIcon(type?: AlertType): string {
    switch (type) {
      case 'success': return '✓';
      case 'warning': return '⚠';
      case 'error': return '✕';
      case 'info': return 'ℹ';
      default: return 'ℹ';
    }
  }

  /**
   * Get alert icon class
   */
  getAlertIconClass(type?: AlertType): string {
    return `alert-icon alert-icon--${type || 'info'}`;
  }

  /**
   * Trap focus within modal
   */
  @HostListener('keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || this.modals.length === 0) return;

    const modal = this.modals[this.modals.length - 1];
    const modalElement = document.getElementById(modal.config.id);

    if (!modalElement) return;

    const focusableElements = modalElement.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable?.focus();
      }
    }
  }

  /**
   * Auto-focus first element when modal opens
   */
  focusFirstElement(modalId: string): void {
    setTimeout(() => {
      const modalElement = document.getElementById(modalId);
      if (modalElement) {
        const focusableElements = modalElement.querySelectorAll(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0] as HTMLElement;
        firstFocusable?.focus();
      }
    }, 100);
  }

  /**
   * Track modals by id
   */
  trackByModalId(_index: number, modal: ActiveModal): string {
    return modal.config.id;
  }
}
