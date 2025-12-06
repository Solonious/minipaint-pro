export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';
export const IS_PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
export const PASSWORD_MESSAGE =
  'Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, and one number';

export const BCRYPT_ROUNDS = 12;

export const TOKEN_EXPIRY = {
  EMAIL_VERIFICATION: 24 * 60 * 60 * 1000, // 24 hours
  PASSWORD_RESET: 60 * 60 * 1000, // 1 hour
};
