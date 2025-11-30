import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppAvatarComponent } from '../../shared/components/app-avatar/app-avatar.component';
import {
  AppAvatarGroupComponent,
  AvatarUser,
} from '../../shared/components/app-avatar-group/app-avatar-group.component';

@Component({
  selector: 'app-avatar-examples',
  standalone: true,
  imports: [CommonModule, AppAvatarComponent, AppAvatarGroupComponent],
  templateUrl: './avatar-examples.component.html',
  styleUrl: './avatar-examples.component.scss',
})
export class AvatarExamplesComponent {
  // Sample users data
  users: AvatarUser[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      avatar: 'https://i.pravatar.cc/150?img=1',
      status: 'online',
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.chen@example.com',
      avatar: 'https://i.pravatar.cc/150?img=13',
      status: 'busy',
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      email: 'emily.r@example.com',
      avatar: 'https://i.pravatar.cc/150?img=5',
      status: 'away',
    },
    {
      id: 4,
      name: 'David Kim',
      email: 'david.kim@example.com',
      avatar: 'https://i.pravatar.cc/150?img=14',
      status: 'online',
    },
    {
      id: 5,
      name: 'Jessica Martinez',
      email: 'jessica.m@example.com',
      avatar: 'https://i.pravatar.cc/150?img=9',
      status: 'offline',
    },
    {
      id: 6,
      name: 'Ryan Thompson',
      email: 'ryan.t@example.com',
      status: 'online',
    },
    {
      id: 7,
      name: 'Amanda Foster',
      email: 'amanda.f@example.com',
      status: 'away',
    },
    {
      id: 8,
      name: 'Christopher Lee',
      email: 'chris.lee@example.com',
      avatar: 'https://i.pravatar.cc/150?img=12',
      status: 'online',
    },
    {
      id: 9,
      name: 'Lauren Baker',
      email: 'lauren.b@example.com',
      status: 'busy',
    },
    {
      id: 10,
      name: 'James Wilson',
      email: 'james.w@example.com',
      avatar: 'https://i.pravatar.cc/150?img=15',
      status: 'online',
    },
  ];

  selectedUsers = signal<AvatarUser[]>([
    this.users[0],
    this.users[1],
    this.users[3],
  ]);

  selectedTeamMembers = signal<AvatarUser[]>([
    this.users[0],
    this.users[2],
    this.users[4],
    this.users[6],
    this.users[8],
  ]);

  singleSelectedUser = signal<AvatarUser[]>([]);

  onSelectionChange(users: AvatarUser[]): void {
    this.selectedUsers.set(users);
    console.log('Selected users:', users);
  }

  onTeamChange(users: AvatarUser[]): void {
    this.selectedTeamMembers.set(users);
    console.log('Team members:', users);
  }

  onSingleUserChange(users: AvatarUser[]): void {
    this.singleSelectedUser.set(users);
    console.log('Selected user:', users);
  }
}
