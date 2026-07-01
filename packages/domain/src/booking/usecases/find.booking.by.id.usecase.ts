import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { BookingNotFoundError } from '../errors';
import type { BookingProps } from '../booking.entity';

export interface FindBookingByIdCommand {
  bookingId: string;
}

export const IFindBookingByIdUseCase = Symbol('IFindBookingByIdUseCase');

export interface FindBookingByIdUseCase {
  execute(
    command: FindBookingByIdCommand,
  ): Promise<Result<BookingProps, BookingNotFoundError | UnauthorizedError | InfrastructureError>>;
}
