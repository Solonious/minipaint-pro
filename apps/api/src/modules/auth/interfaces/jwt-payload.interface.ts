import { UserRole } from '@prisma/client';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: UserRole;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  emailVerified: boolean;
}
