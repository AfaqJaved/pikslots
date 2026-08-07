import type { InfrastructureError, Result } from '../../shared';
import type { UserInactiveError, UserNotFoundError, UserSuspendedError } from '../errors';

export interface GetAvailableDatesCommand {
  userId: string;
  businessId: string;
  serviceId: string;
  businessTimezone: string;
}
export const IGetAvailableDatesForBookingUseCase = Symbol('IGetAvailableDatesForBookingUseCase');

export interface AvailableBookingDates {
  dates: string[];
}

export interface GetAvailableDatesForBookingUseCase {
  execute(
    command: GetAvailableDatesCommand,
  ): Promise<
    Result<
      AvailableBookingDates,
      UserNotFoundError | UserSuspendedError | UserInactiveError | InfrastructureError
    >
  >;
}
