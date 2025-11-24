import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthenticatedSocket } from '../types/authenticated-socket.type';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token = this.extractTokenFromHandshake(client);

    if (!token) {
      throw new WsException('Unauthorized');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'your-secret-key',
      });

      (client as AuthenticatedSocket).user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        name: payload.name,
        avatar: payload.avatar,
        isActive: payload.isActive,
        emailVerified: payload.emailVerified,
      };

      return true;
    } catch {
      throw new WsException('Invalid token');
    }
  }

  private extractTokenFromHandshake(client: Socket): string | undefined {
    const token =
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.replace('Bearer ', '');
    return token;
  }
}
