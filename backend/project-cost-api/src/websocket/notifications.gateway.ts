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
  namespace: 'notifications',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  },
})
@UseGuards(WsAuthGuard)
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, Set<string>> = new Map();

  async handleConnection(client: AuthenticatedSocket) {
    const userId = client.user.id;

    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }

    this.userSockets.get(userId).add(client.id);

    client.join(`user:${userId}`);

    console.log(
      `[Notifications] User ${userId} connected (socket: ${client.id})`,
    );

    client.emit('connected', {
      message: 'Connected to notifications',
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

    console.log(
      `[Notifications] User ${userId} disconnected (socket: ${client.id})`,
    );
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { notificationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    return {
      event: 'notificationRead',
      data: { notificationId: data.notificationId },
    };
  }

  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  sendNotificationUpdate(userId: string, data: any) {
    this.server.to(`user:${userId}`).emit('notificationUpdate', data);
  }

  getOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }
}
