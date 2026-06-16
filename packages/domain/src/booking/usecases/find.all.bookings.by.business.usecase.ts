import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { BookingProps } from '../booking.entity';

export const IFindAllBookingsByBusinessUseCase = Symbol('IFindAllBookingsByBusinessUseCase');

export interface FindAllBookingsByBusinessUseCase {
  execute(
    businessId: string,
  ): Promise<
    Result<
      Pick<
        BookingProps,
        | 'id'
        | 'bookingId'
        | 'bookingDate'
        | 'bookingStartTime'
        | 'bookingEndTime'
        | 'serviceSnapshot'
        | 'serviceId'
        | 'customerId'
      >[],
      UnauthorizedError | InfrastructureError
    >
  >;
}
