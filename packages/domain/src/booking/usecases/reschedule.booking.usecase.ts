import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { BookingNotFoundError, BookingConflictError } from '../errors';

export interface RescheduleBookingCommand {
  id: string;
  bookingDate: string;
  bookingStartTime: string;
  bookingEndTime: string;
  updatedBy: string;
}

export const IRescheduleBookingUseCase = Symbol('IRescheduleBookingUseCase');

export interface RescheduleBookingUseCase {
  execute(
    command: RescheduleBookingCommand,
  ): Promise<
    Result<void, BookingNotFoundError | BookingConflictError | UnauthorizedError | InfrastructureError>
  >;
}
