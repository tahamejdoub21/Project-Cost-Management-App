import { Request } from 'express';
import { JwtUser } from './jwt-user.type';

export interface RequestWithUser extends Request {
  user: JwtUser;
}
