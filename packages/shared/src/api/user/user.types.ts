export type UserRole =
  | 'Platform Owner'
  | 'Business Owner'
  | 'No Access'
  | 'Standard'
  | 'Enhanced'
  | 'Admin';

// --- Requests ---

export interface FullNameInput {
  firstName: string;
  lastName: string;
}

export interface InviteUserInput {
  username: string;
  email: string;
  name: FullNameInput;
  role: UserRole;
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

export interface InviteUserResponse {
  message: 'success';
}

export interface LogoutUserResponse {
  message: 'success';
}

export interface LoginUserResponse {
  accessToken: string;
}

export interface RefreshUserSessionResponse {
  accessToken: string;
}

export interface GetUserProfileResponse {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  name: FullNameInput;
  role: UserRole;
  avatarUrl: string | null;
  bookingUrl: string;
}

export interface UserSummary {
  id: string;
  username: string;
  email: string;
  name: FullNameInput;
}

export type GetAllBusinessOwnersResponse = UserSummary[];

export interface GetUsersByRoleInput {
  role: UserRole;
}

export type GetUsersByRoleResponse = UserSummary[];

// --- Working Hours ---

export interface UserDayHours {
  enabled: boolean;
  openTime: string; // 'HH:mm' 24-hour
  closeTime: string; // 'HH:mm' 24-hour
}

export interface UpdateUserWorkingHoursInput {
  monday: UserDayHours;
  tuesday: UserDayHours;
  wednesday: UserDayHours;
  thursday: UserDayHours;
  friday: UserDayHours;
  saturday: UserDayHours;
  sunday: UserDayHours;
}

export type UpdateUserWorkingHoursResponse = UpdateUserWorkingHoursInput;
