import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppAvatarComponent, AvatarSize } from '../app-avatar/app-avatar.component';


export interface AvatarUser {
  id: string | number;
  name: string;
  avatar?: string;
  email?: string;
  status?: 'online' | 'offline' | 'away' | 'busy' | 'none';
}

@Component({
  selector: 'app-avatar-group',
  standalone: true,
  imports: [CommonModule, FormsModule, AppAvatarComponent],
  templateUrl: './app-avatar-group.component.html',
  styleUrl: './app-avatar-group.component.scss',
})
export class AppAvatarGroupComponent {
  @Input() users: AvatarUser[] = [];
  @Input() selectedUsers: AvatarUser[] = [];
  @Input() size: AvatarSize = 'md';
  @Input() max: number = 5;
  @Input() multiSelect: boolean = true;
  @Input() showStatus: boolean = false;
  @Input() border: boolean = true;
  @Input() label?: string;
  @Input() placeholder: string = 'Select members...';
  @Input() searchPlaceholder: string = 'Search members...';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;

  @Output() selectionChange = new EventEmitter<AvatarUser[]>();

  isOpen = signal(false);
  searchQuery = '';

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  toggleDropdown(): void {
    if (!this.disabled) {
      this.isOpen.update((value) => !value);
    }
  }

  getVisibleUsers(): AvatarUser[] {
    return this.selectedUsers.slice(0, this.max);
  }

  getRemainingCount(): number {
    return Math.max(0, this.selectedUsers.length - this.max);
  }

  getFilteredUsers(): AvatarUser[] {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      return this.users;
    }
    return this.users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
    );
  }

  isUserSelected(user: AvatarUser): boolean {
    return this.selectedUsers.some((u) => u.id === user.id);
  }

  toggleUser(user: AvatarUser): void {
    if (this.disabled) return;

    if (this.multiSelect) {
      const isSelected = this.isUserSelected(user);
      if (isSelected) {
        const updated = this.selectedUsers.filter((u) => u.id !== user.id);
        this.selectionChange.emit(updated);
      } else {
        const updated = [...this.selectedUsers, user];
        this.selectionChange.emit(updated);
      }
    } else {
      this.selectionChange.emit([user]);
      this.isOpen.set(false);
    }
  }

  onSearchChange(value: string): void {
    this.searchQuery =(value);
  }

  clearSelection(): void {
    if (!this.disabled) {
      this.selectionChange.emit([]);
    }
  }

  getPlaceholderText(): string {
    if (this.selectedUsers.length === 0) {
      return this.placeholder;
    }
    if (this.selectedUsers.length === 1) {
      return this.selectedUsers[0].name;
    }
    return `${this.selectedUsers.length} members selected`;
  }

  getUserStatus(user: AvatarUser): 'online' | 'offline' | 'away' | 'busy' | 'none' {
    return this.showStatus && user.status ? user.status : 'none';
  }
}
