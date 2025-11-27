import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ModalType = 'dialog' | 'alert' | 'drawer-right' | 'drawer-left';
export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type AlertType = 'success' | 'warning' | 'error' | 'info';

export interface ModalConfig {
  id: string;
  type: ModalType;
  size?: ModalSize;
  title?: string;
  content?: string;
  component?: any;
  data?: any;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  alertType?: AlertType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  customClass?: string;
}

export interface ActiveModal {
  config: ModalConfig;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalsSubject = new BehaviorSubject<ActiveModal[]>([]);
  public modals$: Observable<ActiveModal[]> = this.modalsSubject.asObservable();

  private scrollY = 0;
  private modalCounter = 0;

  constructor() {
    // Listen for escape key globally
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.handleEscapeKey();
        }
      });
    }
  }

  /**
   * Open a dialog modal
   */
  openDialog(config: Partial<ModalConfig>): Promise<any> {
    return this.open({
      type: 'dialog',
      size: 'md',
      showCloseButton: true,
      closeOnBackdropClick: true,
      closeOnEscape: true,
      ...config
    });
  }

  /**
   * Open an alert modal
   */
  openAlert(config: Partial<ModalConfig>): Promise<any> {
    return this.open({
      type: 'alert',
      size: 'sm',
      showCloseButton: false,
      closeOnBackdropClick: false,
      closeOnEscape: true,
      alertType: 'info',
      confirmText: 'OK',
      ...config
    });
  }

  /**
   * Open a success alert
   */
  success(title: string, content?: string): Promise<any> {
    return this.openAlert({
      title,
      content,
      alertType: 'success',
      confirmText: 'OK'
    });
  }

  /**
   * Open a warning alert
   */
  warning(title: string, content?: string): Promise<any> {
    return this.openAlert({
      title,
      content,
      alertType: 'warning',
      confirmText: 'OK'
    });
  }

  /**
   * Open an error alert
   */
  error(title: string, content?: string): Promise<any> {
    return this.openAlert({
      title,
      content,
      alertType: 'error',
      confirmText: 'OK'
    });
  }

  /**
   * Open an info alert
   */
  info(title: string, content?: string): Promise<any> {
    return this.openAlert({
      title,
      content,
      alertType: 'info',
      confirmText: 'OK'
    });
  }

  /**
   * Open a confirmation dialog
   */
  confirm(title: string, content?: string): Promise<boolean> {
    return this.openAlert({
      title,
      content,
      alertType: 'warning',
      confirmText: 'Confirm',
      cancelText: 'Cancel'
    }).then(() => true).catch(() => false);
  }

  /**
   * Open a drawer from the right
   */
  openDrawerRight(config: Partial<ModalConfig>): Promise<any> {
    return this.open({
      type: 'drawer-right',
      size: 'md',
      showCloseButton: true,
      closeOnBackdropClick: true,
      closeOnEscape: true,
      ...config
    });
  }

  /**
   * Open a drawer from the left
   */
  openDrawerLeft(config: Partial<ModalConfig>): Promise<any> {
    return this.open({
      type: 'drawer-left',
      size: 'md',
      showCloseButton: true,
      closeOnBackdropClick: true,
      closeOnEscape: true,
      ...config
    });
  }

  /**
   * Generic open method
   */
  private open(config: Partial<ModalConfig>): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = config.id || `modal-${++this.modalCounter}`;
      const fullConfig: ModalConfig = {
        id,
        type: 'dialog',
        size: 'md',
        showCloseButton: true,
        closeOnBackdropClick: true,
        closeOnEscape: true,
        ...config
      };

      const activeModal: ActiveModal = {
        config: fullConfig,
        resolve,
        reject
      };

      const currentModals = this.modalsSubject.value;

      // Lock body scroll when opening first modal
      if (currentModals.length === 0) {
        this.lockBodyScroll();
      }

      this.modalsSubject.next([...currentModals, activeModal]);
    });
  }

  /**
   * Close a specific modal
   */
  close(id: string, result?: any): void {
    const currentModals = this.modalsSubject.value;
    const modalIndex = currentModals.findIndex(m => m.config.id === id);

    if (modalIndex !== -1) {
      const modal = currentModals[modalIndex];
      modal.resolve(result);

      const updatedModals = currentModals.filter(m => m.config.id !== id);
      this.modalsSubject.next(updatedModals);

      // Unlock body scroll when closing last modal
      if (updatedModals.length === 0) {
        this.unlockBodyScroll();
      }
    }
  }

  /**
   * Dismiss a specific modal (rejected)
   */
  dismiss(id: string, reason?: any): void {
    const currentModals = this.modalsSubject.value;
    const modalIndex = currentModals.findIndex(m => m.config.id === id);

    if (modalIndex !== -1) {
      const modal = currentModals[modalIndex];
      modal.reject(reason);

      const updatedModals = currentModals.filter(m => m.config.id !== id);
      this.modalsSubject.next(updatedModals);

      // Unlock body scroll when closing last modal
      if (updatedModals.length === 0) {
        this.unlockBodyScroll();
      }
    }
  }

  /**
   * Close all modals
   */
  closeAll(): void {
    const currentModals = this.modalsSubject.value;
    currentModals.forEach(modal => modal.reject('All modals closed'));
    this.modalsSubject.next([]);
    this.unlockBodyScroll();
  }

  /**
   * Get the topmost modal
   */
  getTopModal(): ActiveModal | null {
    const modals = this.modalsSubject.value;
    return modals.length > 0 ? modals[modals.length - 1] : null;
  }

  /**
   * Handle escape key press
   */
  private handleEscapeKey(): void {
    const topModal = this.getTopModal();
    if (topModal && topModal.config.closeOnEscape) {
      this.dismiss(topModal.config.id, 'escape');
    }
  }

  /**
   * Lock body scroll
   */
  private lockBodyScroll(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // Save current scroll position
    this.scrollY = window.scrollY || window.pageYOffset;

    // Get scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Apply styles to prevent scrolling while maintaining position
    document.body.style.position = 'fixed';
    document.body.style.top = `-${this.scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    // Prevent layout shift by adding padding equal to scrollbar width
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }

  /**
   * Unlock body scroll
   */
  private unlockBodyScroll(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const scrollY = this.scrollY;

    // Remove all styles in a single batch to prevent flicker
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';

    // Restore scroll position immediately without animation
    // Use both scrollTo methods for maximum compatibility
    if (scrollY > 0) {
      window.scrollTo({
        top: scrollY,
        left: 0,
        behavior: 'instant' as ScrollBehavior
      });

      // Fallback for browsers that don't support 'instant'
      if (window.scrollY !== scrollY) {
        window.scrollTo(0, scrollY);
      }
    }
  }
}
