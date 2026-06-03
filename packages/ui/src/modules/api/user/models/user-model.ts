import type {
	BusinessUserSummary,
	GetBusinessUsersResponse,
	GetUserProfileResponse,
	GetUsersByRoleInput,
	GetUsersByRoleResponse,
	InviteUserInput,
	InviteUserResponse,
	LoginUserInput,
	LoginUserResponse,
	LogoutUserResponse,
	RefreshUserSessionResponse,
	UserSummary
} from '@pikslots/shared';

export type UserProfileModel = GetUserProfileResponse;
export type UserInviteInput = InviteUserInput;
export type UserInviteResult = InviteUserResponse;
export type UserLoginInput = LoginUserInput;
export type UserLoginResult = LoginUserResponse;
export type UserLogoutResult = LogoutUserResponse;
export type UserRefreshSessionResult = RefreshUserSessionResponse;
export type UserByRoleInput = GetUsersByRoleInput;
export type UserByRoleResult = GetUsersByRoleResponse;
export type UserModel = UserSummary;
export type BusinessUserModel = BusinessUserSummary;
export type BusinessUsersResult = GetBusinessUsersResponse;
