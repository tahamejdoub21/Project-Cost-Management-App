# Avatar Component

A flexible avatar component that displays user profile images, initials, and status indicators.

## Features

- **Image Support**: Display user profile images with automatic fallback to initials
- **Initials**: Auto-generated from name or custom initials
- **Status Indicators**: Online, offline, away, busy, or none
- **6 Size Variants**: xs, sm, md, lg, xl, 2xl
- **Color Generation**: Automatic background colors for initials based on user name
- **Border & Rounded**: Optional border and rounded corners
- **Clickable**: Interactive hover effects when clickable

## Usage

```typescript
import { AppAvatarComponent } from './shared/components/app-avatar';
```

```html
<!-- With image -->
<app-avatar
  src="https://example.com/avatar.jpg"
  alt="John Doe"
  size="md"
  status="online"
  [border]="true"
></app-avatar>

<!-- With initials only -->
<app-avatar
  alt="Sarah Johnson"
  size="lg"
></app-avatar>

<!-- Custom initials -->
<app-avatar
  initials="AB"
  alt="Alice Brown"
  size="md"
></app-avatar>

<!-- Clickable avatar -->
<app-avatar
  src="https://example.com/avatar.jpg"
  alt="John Doe"
  [clickable]="true"
></app-avatar>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | `undefined` | Image source URL |
| `alt` | `string` | `''` | Alternative text for accessibility |
| `initials` | `string` | `undefined` | Custom initials (max 2 characters) |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'` | `'md'` | Avatar size |
| `status` | `'online' \| 'offline' \| 'away' \| 'busy' \| 'none'` | `'none'` | Status indicator |
| `border` | `boolean` | `false` | Show white border |
| `rounded` | `boolean` | `true` | Rounded corners (circular) |
| `clickable` | `boolean` | `false` | Enable hover effects |

## Sizes

- **xs**: 24px
- **sm**: 32px
- **md**: 40px (default)
- **lg**: 48px
- **xl**: 64px
- **2xl**: 80px

## Status Colors

- **online**: Green
- **offline**: Gray
- **away**: Yellow/Amber
- **busy**: Red
