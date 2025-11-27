import { Injectable, signal } from '@angular/core';

export interface OverlayInstance {
  id: string;
  type: 'calendar' | 'dropdown' | 'menu';
  close: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class OverlayManagerService {
  private activeOverlay = signal<OverlayInstance | null>(null);

  /**
   * Register a new overlay and close any existing ones
   * @param overlay The overlay instance to register
   * @returns true if registered successfully, false if another overlay is active
   */
  register(overlay: OverlayInstance): boolean {
    const current = this.activeOverlay();

    // If there's an active overlay, close it first
    if (current && current.id !== overlay.id) {
      current.close();
    }

    // Register the new overlay
    this.activeOverlay.set(overlay);
    return true;
  }

  /**
   * Unregister an overlay
   * @param id The overlay ID to unregister
   */
  unregister(id: string): void {
    const current = this.activeOverlay();
    if (current && current.id === id) {
      this.activeOverlay.set(null);
    }
  }

  /**
   * Close the currently active overlay
   */
  closeActive(): void {
    const current = this.activeOverlay();
    if (current) {
      current.close();
      this.activeOverlay.set(null);
    }
  }

  /**
   * Check if a specific overlay is currently active
   * @param id The overlay ID to check
   */
  isActive(id: string): boolean {
    const current = this.activeOverlay();
    return current?.id === id;
  }

  /**
   * Get the currently active overlay
   */
  getActive(): OverlayInstance | null {
    return this.activeOverlay();
  }
}
