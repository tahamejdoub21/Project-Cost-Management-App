import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy' | 'none';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-avatar.component.html',
  styleUrl: './app-avatar.component.scss',
})
export class AppAvatarComponent {
  @Input() src?: string;
  @Input() alt: string = '';
  @Input() initials?: string;
  @Input() size: AvatarSize = 'md';
  @Input() status: AvatarStatus = 'none';
  @Input() border: boolean = false;
  @Input() rounded: boolean = true;
  @Input() clickable: boolean = false;

  imageError: boolean = false;

  onImageError(): void {
    this.imageError = true;
  }

  getInitials(): string {
    if (this.initials) {
      return this.initials.slice(0, 2).toUpperCase();
    }
    if (this.alt) {
      const words = this.alt.trim().split(' ');
      if (words.length >= 2) {
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
      }
      return this.alt.slice(0, 2).toUpperCase();
    }
    return '??';
  }

  getBackgroundColor(): string {
    const text = this.initials || this.alt || '';
    const colors = [
      '#14b8a6',
      '#a855f7',
      '#06b6d4',
      '#3b82f6',
      '#8b5cf6',
      '#ec4899',
      '#f59e0b',
      '#10b981',
    ];
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }
}
