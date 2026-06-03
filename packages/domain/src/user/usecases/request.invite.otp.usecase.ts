import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { InviteAlreadyAcceptedError, UserNotFoundError } from '../errors';

export interface RequestInviteOtpCommand {
  token: string; // contains {userId : string, businessId : string}
}

export const IRequestInviteOtpUseCase = Symbol('IRequestInviteOtpUseCase');

export interface RequestInviteOtpUseCase {
  execute(
    command: RequestInviteOtpCommand,
  ): Promise<
    Result<
      { message: 'success' },
      UnauthorizedError | UserNotFoundError | InviteAlreadyAcceptedError | InfrastructureError
    >
  >;
}
