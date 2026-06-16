import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { BookingConflictError } from '../errors';
import type { Booking, ServiceSnapshot } from '../booking.entity';

export interface CreateBookingCommand {
  bookingDate: string;
  bookingStartTime: string;
  bookingEndTime: string;
  businessId: string;
  serviceId: string;
  serviceSnapshot: ServiceSnapshot;
  customerId: string;
  createdBy: string;
}

export const ICreateBookingUseCase = Symbol('ICreateBookingUseCase');

export interface CreateBookingUseCase {
  execute(
    command: CreateBookingCommand,
  ): Promise<Result<Booking, BookingConflictError | UnauthorizedError | InfrastructureError>>;
}
