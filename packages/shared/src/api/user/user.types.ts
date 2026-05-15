export type UserRole = 'superAdmin' | 'businessOwner' | 'locationOwner';

// --- Requests ---

export interface FullNameInput {
  firstName: string;
  lastName: string;
}

export interface RegisterUserInput {
  username: string;
  email: string;
  password: string;
  name: FullNameInput;
  role: UserRole;
  timezone: string;
  phone?: string;
}

export interface LoginUserInput {
  usernameOrEmail: string;
  password: string;
}

export interface RefreshUserSessionInput {
  currentRefreshToken: string;
}

// --- Responses ---

export interface RegisterUserResponse {
  message: 'success';
}

export interface LoginUserResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshUserSessionResponse {
  accessToken: string;
  refreshToken: string;
}
