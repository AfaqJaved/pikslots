import type { UserInactiveError, UserNotFoundError, UserSuspendedError } from '../../../dist';
import type { InfrastructureError, UnauthorizedError, ValidationError, Result } from '../../shared';

export interface RefreshUserSessionCommand {
  currentRefreshToken: string;
}

export const IRefreshUserSessionUseCase = Symbol('IRefreshUserSessionUseCase');

export interface RefreshUserSessionUseCase {
  execute(command: RefreshUserSessionCommand): Promise<
    Result<
      { accessToken: string; refreshToken: string },
      | UnauthorizedError // token is valid in shape but rejected: expired, revoked, not found, or reused (rotation violation)
      | UserNotFoundError // the user who want to refresh token does not exsits
      | ValidationError // token string is malformed and cannot be parsed
      | InfrastructureError // DB or cache failure during lookup or session write
      | UserSuspendedError // User has been suspended
      | UserInactiveError // User has been inactive
    >
  >;
}
