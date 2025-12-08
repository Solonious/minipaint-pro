import { UserRole } from './auth.model';

// Admin user with extended fields
export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  emailVerified: boolean;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Paginated response for user list
export interface AdminUserListResponse {
  data: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
}

// Query params for user list
export interface AdminUserListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  emailVerified?: boolean;
  sortBy?: 'email' | 'displayName' | 'createdAt' | 'lastLoginAt' | 'role';
  sortOrder?: 'asc' | 'desc';
}

// Update user request
export interface UpdateUserRequest {
  displayName?: string;
  role?: UserRole;
  isActive?: boolean;
  emailVerified?: boolean;
}

// Single user response
export interface AdminUserResponse {
  data: AdminUser;
}
