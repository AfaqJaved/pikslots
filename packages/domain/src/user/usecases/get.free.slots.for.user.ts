import type { InfrastructureError, Result, Slot } from '../../shared';
import type { UserInactiveError, UserNotFoundError, UserSuspendedError } from '../errors';

export interface GetFreeSlotsForUserCommand {
  userId: string;
  businessId: string;
  date: string; // 'YYYY-MM-DD'
  durationInMins: number;
  bufferTimeInMins: number;
  businessTimezone: string; // IANA timezone, e.g. 'America/New_York' — needed to convert HH:mm working hours to UTC
}

export const IGetFreeSlotsForUser = Symbol('IGetFreeSlotsForUser');

export interface GetFreeSlotsForUser {
  execute(
    command: GetFreeSlotsForUserCommand,
  ): Promise<
    Result<Slot[], UserNotFoundError | UserSuspendedError | UserInactiveError | InfrastructureError>
  >;
}
