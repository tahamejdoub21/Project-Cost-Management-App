import { Socket } from 'socket.io';
import { JwtUser } from '../../auth/types/jwt-user.type';

export interface AuthenticatedSocket extends Socket {
  user: JwtUser;
}
