# WebSocket Real-Time Features Documentation

## Overview

The backend now supports **real-time communication** via WebSocket for notifications and chat functionality. This enables instant updates without polling, improving user experience and reducing server load.

## WebSocket Namespaces

The application uses two separate WebSocket namespaces:

### 1. Notifications Namespace
**URL**: `ws://localhost:3000/notifications`

Handles real-time notification delivery and updates.

### 2. Chat Namespace
**URL**: `ws://localhost:3000/chat`

Handles real-time messaging, discussions, and presence tracking.

---

## Authentication

All WebSocket connections require JWT authentication. Pass the token in one of two ways:

### Method 1: Auth Object (Recommended)
```javascript
const socket = io('http://localhost:3000/notifications', {
  auth: {
    token: 'your-jwt-token-here'
  }
});
```

### Method 2: Authorization Header
```javascript
const socket = io('http://localhost:3000/notifications', {
  extraHeaders: {
    Authorization: 'Bearer your-jwt-token-here'
  }
});
```

---

## Notifications Namespace

### Connection

```javascript
import { io } from 'socket.io-client';

const notificationSocket = io('http://localhost:3000/notifications', {
  auth: { token: userToken }
});

notificationSocket.on('connect', () => {
  console.log('Connected to notifications');
});

notificationSocket.on('connected', (data) => {
  console.log('Confirmation:', data);
  // { message: 'Connected to notifications', userId: 'user-id' }
});
```

### Events to Listen For

#### `notification` - New Notification Received
Emitted when a new notification is created for the user.

```javascript
notificationSocket.on('notification', (notification) => {
  console.log('New notification:', notification);

  // notification object:
  {
    id: 'uuid',
    userId: 'user-uuid',
    type: 'TASK_ASSIGNED',
    title: 'New Task Assigned',
    message: 'You have been assigned to Task XYZ',
    data: { taskId: 'task-uuid', projectId: 'project-uuid' },
    isRead: false,
    relatedEntity: 'Task',
    relatedEntityId: 'task-uuid',
    createdAt: '2025-01-23T10:00:00Z',
    updatedAt: '2025-01-23T10:00:00Z'
  }

  // Display toast notification, update UI, etc.
  showToast(notification.title, notification.message);
  updateNotificationBadge();
});
```

#### `notificationUpdate` - Notification Status Changed
Emitted when notifications are marked as read.

```javascript
notificationSocket.on('notificationUpdate', (data) => {
  console.log('Notification update:', data);

  // Single notification marked as read:
  // { type: 'read', notificationId: 'uuid' }

  // All notifications marked as read:
  // { type: 'readAll', count: 5 }

  if (data.type === 'read') {
    markNotificationAsReadInUI(data.notificationId);
  } else if (data.type === 'readAll') {
    clearAllNotificationsInUI();
  }
});
```

### Events to Emit

#### `markAsRead` - Mark Notification as Read
```javascript
notificationSocket.emit('markAsRead', {
  notificationId: 'notification-uuid'
});

// Server will respond with:
notificationSocket.on('notificationRead', (data) => {
  console.log('Marked as read:', data.notificationId);
});
```

### Example: React Hook for Notifications

```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useNotifications(token: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const notifSocket = io('http://localhost:3000/notifications', {
      auth: { token }
    });

    notifSocket.on('connect', () => {
      console.log('Connected to notifications');
    });

    notifSocket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Show toast
      showToast(notification.title, notification.message);
    });

    notifSocket.on('notificationUpdate', (data) => {
      if (data.type === 'readAll') {
        setUnreadCount(0);
      } else if (data.type === 'read') {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    });

    setSocket(notifSocket);

    return () => {
      notifSocket.disconnect();
    };
  }, [token]);

  const markAsRead = (notificationId: string) => {
    socket?.emit('markAsRead', { notificationId });
  };

  return { socket, notifications, unreadCount, markAsRead };
}
```

---

## Chat Namespace

### Connection

```javascript
import { io } from 'socket.io-client';

const chatSocket = io('http://localhost:3000/chat', {
  auth: { token: userToken }
});

chatSocket.on('connect', () => {
  console.log('Connected to chat');
});

chatSocket.on('connected', (data) => {
  console.log('Confirmation:', data);
  // { message: 'Connected to chat', userId: 'user-id' }
});
```

### Room Management

#### Join Project Room
```javascript
chatSocket.emit('joinProject', { projectId: 'project-uuid' });

chatSocket.on('joinedProject', (data) => {
  console.log('Joined project:', data);
  // { projectId: 'project-uuid', onlineUsers: ['user1', 'user2'] }
});

chatSocket.on('userJoined', (data) => {
  console.log('User joined project:', data);
  // { userId: 'user-uuid', projectId: 'project-uuid', onlineUsers: [...] }
  updateOnlineUsersList(data.onlineUsers);
});
```

#### Leave Project Room
```javascript
chatSocket.emit('leaveProject', { projectId: 'project-uuid' });

chatSocket.on('leftProject', (data) => {
  console.log('Left project:', data);
  // { projectId: 'project-uuid' }
});

chatSocket.on('userLeft', (data) => {
  console.log('User left:', data);
  // { userId: 'user-uuid', projectId: 'project-uuid' }
});
```

#### Join Discussion Room
```javascript
chatSocket.emit('joinDiscussion', { discussionId: 'discussion-uuid' });

chatSocket.on('joinedDiscussion', (data) => {
  console.log('Joined discussion:', data);
  // { discussionId: 'discussion-uuid', onlineUsers: [...] }
});
```

#### Leave Discussion Room
```javascript
chatSocket.emit('leaveDiscussion', { discussionId: 'discussion-uuid' });

chatSocket.on('leftDiscussion', (data) => {
  console.log('Left discussion:', data);
});
```

### Real-Time Messages

#### Receive New Messages
```javascript
chatSocket.on('newMessage', (message) => {
  console.log('New message:', message);

  // message object:
  {
    id: 'uuid',
    content: 'Hello team!',
    discussionId: 'discussion-uuid',
    projectId: null,
    userId: 'sender-uuid',
    messageType: 'TEXT',
    attachments: null,
    readBy: ['sender-uuid'],
    createdAt: '2025-01-23T10:00:00Z',
    updatedAt: '2025-01-23T10:00:00Z',
    user: {
      id: 'sender-uuid',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'avatar-url'
    }
  }

  // Add message to chat UI
  addMessageToChat(message);

  // Play notification sound if from another user
  if (message.userId !== currentUserId) {
    playNotificationSound();
  }
});
```

#### Message Updates
```javascript
chatSocket.on('messageUpdate', (data) => {
  console.log('Message updated:', data);
  // Handle message edits, deletions, etc.
});
```

### Typing Indicators

#### Send Typing Status
```javascript
// User starts typing in a discussion
chatSocket.emit('typing', {
  discussionId: 'discussion-uuid',
  isTyping: true
});

// User stops typing
chatSocket.emit('typing', {
  discussionId: 'discussion-uuid',
  isTyping: false
});

// For project-level chat (no specific discussion)
chatSocket.emit('typing', {
  projectId: 'project-uuid',
  isTyping: true
});
```

#### Receive Typing Status
```javascript
chatSocket.on('userTyping', (data) => {
  console.log('User typing:', data);
  // { userId: 'user-uuid', discussionId: 'discussion-uuid', isTyping: true }

  if (data.isTyping) {
    showTypingIndicator(data.userId);
  } else {
    hideTypingIndicator(data.userId);
  }
});
```

### Example: React Hook for Chat

```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useChat(token: string, discussionId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());

  useEffect(() => {
    const chatSocket = io('http://localhost:3000/chat', {
      auth: { token }
    });

    chatSocket.on('connect', () => {
      console.log('Connected to chat');

      // Join the discussion room
      chatSocket.emit('joinDiscussion', { discussionId });
    });

    chatSocket.on('joinedDiscussion', (data) => {
      setOnlineUsers(data.onlineUsers);
    });

    chatSocket.on('userJoined', (data) => {
      setOnlineUsers(data.onlineUsers);
    });

    chatSocket.on('userLeft', (data) => {
      setOnlineUsers(prev => prev.filter(id => id !== data.userId));
    });

    chatSocket.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);

      // Clear typing indicator for this user
      setTypingUsers(prev => {
        const next = new Set(prev);
        next.delete(message.userId);
        return next;
      });
    });

    chatSocket.on('userTyping', (data) => {
      if (data.isTyping) {
        setTypingUsers(prev => new Set(prev).add(data.userId));
      } else {
        setTypingUsers(prev => {
          const next = new Set(prev);
          next.delete(data.userId);
          return next;
        });
      }
    });

    setSocket(chatSocket);

    return () => {
      chatSocket.emit('leaveDiscussion', { discussionId });
      chatSocket.disconnect();
    };
  }, [token, discussionId]);

  const sendTyping = (isTyping: boolean) => {
    socket?.emit('typing', { discussionId, isTyping });
  };

  return { socket, messages, onlineUsers, typingUsers, sendTyping };
}
```

---

## Integration with REST API

The WebSocket events work seamlessly with the REST API:

### Creating Messages
When you create a message via REST API:

```javascript
// REST API Call
const response = await fetch('http://localhost:3000/discussions/messages', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: 'Hello everyone!',
    discussionId: 'discussion-uuid',
    messageType: 'TEXT'
  })
});

const message = await response.json();
```

**All connected clients** in that discussion will receive the `newMessage` event automatically via WebSocket!

### Creating Notifications
When notifications are created programmatically:

```javascript
// From any service (e.g., TasksService when assigning a task)
await this.notificationsService.create({
  userId: assigneeId,
  type: 'TASK_ASSIGNED',
  title: 'New Task Assigned',
  message: `You have been assigned to ${task.title}`,
  relatedEntity: 'Task',
  relatedEntityId: task.id
});
```

The user will **instantly receive** the notification via WebSocket if they're connected!

---

## Error Handling

### Connection Errors
```javascript
socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);

  if (error.message === 'Unauthorized') {
    // Token is invalid or expired
    // Redirect to login or refresh token
    refreshAuthToken();
  }
});
```

### WebSocket Exceptions
```javascript
socket.on('exception', (error) => {
  console.error('WebSocket exception:', error);
  // Handle specific errors
});
```

### Reconnection
Socket.io handles reconnection automatically:

```javascript
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);

  if (reason === 'io server disconnect') {
    // Server disconnected, manually reconnect
    socket.connect();
  }
  // else: automatic reconnection will happen
});

socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected after', attemptNumber, 'attempts');

  // Rejoin rooms
  socket.emit('joinDiscussion', { discussionId });
});
```

---

## Best Practices

### 1. Clean Up on Component Unmount
```javascript
useEffect(() => {
  const socket = io('...');

  return () => {
    socket.disconnect();
  };
}, []);
```

### 2. Rejoin Rooms After Reconnection
```javascript
socket.on('reconnect', () => {
  // Rejoin all active rooms
  activeDiscussions.forEach(id => {
    socket.emit('joinDiscussion', { discussionId: id });
  });
});
```

### 3. Debounce Typing Indicators
```javascript
let typingTimeout;

function handleTyping() {
  clearTimeout(typingTimeout);

  socket.emit('typing', { discussionId, isTyping: true });

  typingTimeout = setTimeout(() => {
    socket.emit('typing', { discussionId, isTyping: false });
  }, 3000);
}
```

### 4. Handle Offline/Online State
```javascript
window.addEventListener('online', () => {
  if (!socket.connected) {
    socket.connect();
  }
});

window.addEventListener('offline', () => {
  // Notify user they're offline
  showOfflineNotice();
});
```

---

## CORS Configuration

The WebSocket gateways are configured to accept connections from:

```javascript
cors: {
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}
```

Update the `FRONTEND_URL` environment variable for production.

---

## Testing WebSocket Connections

### Using Socket.io Client (Node.js)
```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3000/notifications', {
  auth: { token: 'your-jwt-token' }
});

socket.on('connect', () => {
  console.log('Connected!');
});

socket.on('notification', (data) => {
  console.log('Notification:', data);
});
```

### Using Postman or Insomnia
1. Create a WebSocket connection
2. URL: `ws://localhost:3000/notifications`
3. Add auth message: `{"token": "your-jwt-token"}`

---

## Performance Considerations

### Connection Limits
- Each user can have multiple socket connections (tabs, devices)
- Server tracks all connections per user
- Cleanup happens automatically on disconnect

### Scaling
For production with multiple server instances, consider:
- **Redis Adapter**: For pub/sub across instances
- **Sticky Sessions**: Ensure same client connects to same server

```javascript
// In WebSocketModule (production setup)
import { RedisIoAdapter } from './adapters/redis-io.adapter';

const redisIoAdapter = new RedisIoAdapter(app);
await redisIoAdapter.connectToRedis();
app.useWebSocketAdapter(redisIoAdapter);
```

---

## Notification Types

All supported notification types:

- `TASK_ASSIGNED` - User assigned to task
- `TASK_UPDATED` - Task was updated
- `TASK_COMMENT` - New comment on task
- `PROJECT_INVITE` - Invited to project
- `PROJECT_UPDATE` - Project was updated
- `DEADLINE_REMINDER` - Task deadline approaching
- `TEAM_MESSAGE` - Direct team message
- `SYSTEM` - System notification

---

## Complete Example: Chat Application

```typescript
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

function ChatApp({ token, discussionId }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());

  useEffect(() => {
    const chatSocket = io('http://localhost:3000/chat', {
      auth: { token }
    });

    chatSocket.on('connect', () => {
      chatSocket.emit('joinDiscussion', { discussionId });
    });

    chatSocket.on('joinedDiscussion', (data) => {
      setOnlineUsers(data.onlineUsers);
    });

    chatSocket.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    chatSocket.on('userTyping', ({ userId, isTyping }) => {
      setTypingUsers(prev => {
        const next = new Set(prev);
        isTyping ? next.add(userId) : next.delete(userId);
        return next;
      });
    });

    setSocket(chatSocket);

    return () => {
      chatSocket.disconnect();
    };
  }, [token, discussionId]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    socket?.emit('typing', { discussionId, isTyping: true });

    // Stop typing after 2 seconds of inactivity
    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      socket?.emit('typing', { discussionId, isTyping: false });
    }, 2000);
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    // Send via REST API (will trigger WebSocket event for all users)
    await fetch('http://localhost:3000/discussions/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: inputValue,
        discussionId,
        messageType: 'TEXT'
      })
    });

    setInputValue('');
    socket?.emit('typing', { discussionId, isTyping: false });
  };

  return (
    <div className="chat-container">
      <div className="online-users">
        Online: {onlineUsers.length}
      </div>

      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id} className="message">
            <strong>{msg.user.name}:</strong> {msg.content}
          </div>
        ))}

        {typingUsers.size > 0 && (
          <div className="typing-indicator">
            {typingUsers.size} user(s) typing...
          </div>
        )}
      </div>

      <div className="input-area">
        <input
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
```

---

## Summary

✅ **Real-time notifications** - Instant notification delivery
✅ **Real-time chat** - Live messaging and discussions
✅ **Presence tracking** - See who's online in projects/discussions
✅ **Typing indicators** - Know when someone is typing
✅ **JWT Authentication** - Secure WebSocket connections
✅ **Auto-reconnection** - Handles network issues gracefully
✅ **Room-based** - Efficient message routing
✅ **REST API Integration** - Works seamlessly with existing endpoints

The WebSocket implementation provides a solid foundation for real-time features while maintaining security and scalability!
