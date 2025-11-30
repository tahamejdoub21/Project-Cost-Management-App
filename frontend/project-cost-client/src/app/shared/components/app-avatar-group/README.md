# Avatar Group Component

A powerful avatar group component with dropdown selection, search, and multi-select functionality.

## Features

- **Multi-Select**: Select multiple users or single user mode
- **Search**: Real-time search through users by name or email
- **Overflow Display**: Shows "+N" when exceeding max display count
- **Status Indicators**: Optional status badges on avatars
- **Responsive Dropdown**: Beautiful dropdown with smooth animations
- **Keyboard Accessible**: Full keyboard navigation support
- **Click Outside**: Auto-close on outside click
- **Clear Selection**: Quick clear button when users are selected

## Usage

```typescript
import { AppAvatarGroupComponent, AvatarUser } from './shared/components/app-avatar-group';
```

```html
<!-- Multi-select mode -->
<app-avatar-group
  [users]="users"
  [selectedUsers]="selectedUsers"
  (selectionChange)="onSelectionChange($event)"
  label="Project Team"
  placeholder="Add team members..."
  [max]="4"
  [showStatus]="true"
  [multiSelect]="true"
  size="md"
></app-avatar-group>

<!-- Single select mode -->
<app-avatar-group
  [users]="users"
  [selectedUsers]="selectedUser"
  (selectionChange)="onUserChange($event)"
  label="Task Assignee"
  placeholder="Assign to..."
  [multiSelect]="false"
  [required]="true"
></app-avatar-group>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `users` | `AvatarUser[]` | `[]` | Array of available users |
| `selectedUsers` | `AvatarUser[]` | `[]` | Currently selected users |
| `size` | `AvatarSize` | `'md'` | Size of avatars |
| `max` | `number` | `5` | Max avatars to display before "+N" |
| `multiSelect` | `boolean` | `true` | Enable multi-selection |
| `showStatus` | `boolean` | `false` | Show status indicators |
| `border` | `boolean` | `true` | Show borders on avatars |
| `label` | `string` | `undefined` | Label text |
| `placeholder` | `string` | `'Select members...'` | Placeholder text |
| `searchPlaceholder` | `string` | `'Search members...'` | Search input placeholder |
| `required` | `boolean` | `false` | Show required asterisk |
| `disabled` | `boolean` | `false` | Disable interaction |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `selectionChange` | `AvatarUser[]` | Emitted when selection changes |

## AvatarUser Interface

```typescript
interface AvatarUser {
  id: string | number;
  name: string;
  avatar?: string;
  email?: string;
  status?: 'online' | 'offline' | 'away' | 'busy' | 'none';
}
```

## Example

```typescript
export class MyComponent {
  users: AvatarUser[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      avatar: 'https://example.com/avatar1.jpg',
      status: 'online',
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael@example.com',
      status: 'busy',
    },
  ];

  selectedUsers = signal<AvatarUser[]>([this.users[0]]);

  onSelectionChange(users: AvatarUser[]): void {
    this.selectedUsers.set(users);
    console.log('Selected users:', users);
  }
}
```
