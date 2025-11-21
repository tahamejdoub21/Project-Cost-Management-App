import { UserRole } from '@prisma/client';

export interface JwtUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string | null;
  isActive: boolean;
  emailVerified: boolean;
}
