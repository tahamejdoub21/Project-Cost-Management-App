import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from './guards/ws-auth.guard';
import { AuthenticatedSocket } from './types/authenticated-socket.type';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  },
})
@UseGuards(WsAuthGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private projectUsers: Map<string, Set<string>> = new Map();
  private discussionUsers: Map<string, Set<string>> = new Map();
  private userSockets: Map<string, Set<string>> = new Map();

  async handleConnection(client: AuthenticatedSocket) {
    const userId = client.user.id;

    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }

    this.userSockets.get(userId).add(client.id);

    console.log(`[Chat] User ${userId} connected (socket: ${client.id})`);

    client.emit('connected', {
      message: 'Connected to chat',
      userId,
    });
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.user?.id;

    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId).delete(client.id);

      if (this.userSockets.get(userId).size === 0) {
        this.userSockets.delete(userId);
      }
    }

    this.projectUsers.forEach((users, projectId) => {
      if (users.has(userId)) {
        users.delete(userId);
        this.server
          .to(`project:${projectId}`)
          .emit('userLeft', { userId, projectId });
      }
    });

    this.discussionUsers.forEach((users, discussionId) => {
      if (users.has(userId)) {
        users.delete(userId);
        this.server
          .to(`discussion:${discussionId}`)
          .emit('userLeft', { userId, discussionId });
      }
    });

    console.log(`[Chat] User ${userId} disconnected (socket: ${client.id})`);
  }

  @SubscribeMessage('joinProject')
  async handleJoinProject(
    @MessageBody() data: { projectId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { projectId } = data;
    const userId = client.user.id;

    client.join(`project:${projectId}`);

    if (!this.projectUsers.has(projectId)) {
      this.projectUsers.set(projectId, new Set());
    }

    this.projectUsers.get(projectId).add(userId);

    const onlineUsers = Array.from(this.projectUsers.get(projectId));

    this.server.to(`project:${projectId}`).emit('userJoined', {
      userId,
      projectId,
      onlineUsers,
    });

    return {
      event: 'joinedProject',
      data: { projectId, onlineUsers },
    };
  }

  @SubscribeMessage('leaveProject')
  async handleLeaveProject(
    @MessageBody() data: { projectId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { projectId } = data;
    const userId = client.user.id;

    client.leave(`project:${projectId}`);

    if (this.projectUsers.has(projectId)) {
      this.projectUsers.get(projectId).delete(userId);
    }

    this.server.to(`project:${projectId}`).emit('userLeft', {
      userId,
      projectId,
    });

    return {
      event: 'leftProject',
      data: { projectId },
    };
  }

  @SubscribeMessage('joinDiscussion')
  async handleJoinDiscussion(
    @MessageBody() data: { discussionId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { discussionId } = data;
    const userId = client.user.id;

    client.join(`discussion:${discussionId}`);

    if (!this.discussionUsers.has(discussionId)) {
      this.discussionUsers.set(discussionId, new Set());
    }

    this.discussionUsers.get(discussionId).add(userId);

    const onlineUsers = Array.from(this.discussionUsers.get(discussionId));

    this.server.to(`discussion:${discussionId}`).emit('userJoined', {
      userId,
      discussionId,
      onlineUsers,
    });

    return {
      event: 'joinedDiscussion',
      data: { discussionId, onlineUsers },
    };
  }

  @SubscribeMessage('leaveDiscussion')
  async handleLeaveDiscussion(
    @MessageBody() data: { discussionId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { discussionId } = data;
    const userId = client.user.id;

    client.leave(`discussion:${discussionId}`);

    if (this.discussionUsers.has(discussionId)) {
      this.discussionUsers.get(discussionId).delete(userId);
    }

    this.server.to(`discussion:${discussionId}`).emit('userLeft', {
      userId,
      discussionId,
    });

    return {
      event: 'leftDiscussion',
      data: { discussionId },
    };
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody()
    data: {
      discussionId?: string;
      projectId?: string;
      isTyping: boolean;
    },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const userId = client.user.id;

    if (data.discussionId) {
      client.to(`discussion:${data.discussionId}`).emit('userTyping', {
        userId,
        discussionId: data.discussionId,
        isTyping: data.isTyping,
      });
    } else if (data.projectId) {
      client.to(`project:${data.projectId}`).emit('userTyping', {
        userId,
        projectId: data.projectId,
        isTyping: data.isTyping,
      });
    }
  }

  sendMessageToDiscussion(discussionId: string, message: any) {
    this.server.to(`discussion:${discussionId}`).emit('newMessage', message);
  }

  sendMessageToProject(projectId: string, message: any) {
    this.server.to(`project:${projectId}`).emit('newMessage', message);
  }

  sendMessageUpdate(
    discussionId: string | undefined,
    projectId: string | undefined,
    data: any,
  ) {
    if (discussionId) {
      this.server.to(`discussion:${discussionId}`).emit('messageUpdate', data);
    } else if (projectId) {
      this.server.to(`project:${projectId}`).emit('messageUpdate', data);
    }
  }

  getProjectOnlineUsers(projectId: string): string[] {
    return Array.from(this.projectUsers.get(projectId) || []);
  }

  getDiscussionOnlineUsers(discussionId: string): string[] {
    return Array.from(this.discussionUsers.get(discussionId) || []);
  }
}
