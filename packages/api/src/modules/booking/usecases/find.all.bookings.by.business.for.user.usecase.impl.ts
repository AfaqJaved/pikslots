import { Inject, Injectable } from '@nestjs/common';
import {
  Booking,
  type BookingRepository,
  err,
  FindAllBookingsByBusinessForUserUseCase,
  IBookingRepository,
  InfrastructureError,
  Result,
  UnauthorizedError,
} from '@pikslots/domain';
import type { BookingProps } from '@pikslots/domain';
import { SecurityContext } from 'src/shared/security/context/security.context';

const UNAUTHORIZED_ERROR: UnauthorizedError = {
  kind: 'unauthorized',
  message: 'Access denied',
  timestamp: new Date(),
};

@Injectable()
export class FindAllBookingsByBusinessForUserUseCaseImpl implements FindAllBookingsByBusinessForUserUseCase {
  constructor(
    @Inject(IBookingRepository)
    private readonly bookingRepository: BookingRepository,
    private readonly securityContext: SecurityContext,
  ) {}

  async execute(
    businessId: string,
    userId: string,
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
  > {
    const isPartOfSameBusiness = this.securityContext.businessId === businessId;
    const callerRole = this.securityContext.role;
    const isSelf = this.securityContext.userId === userId;

    if (!Booking.canViewBookings(callerRole, isPartOfSameBusiness, isSelf))
      return err(UNAUTHORIZED_ERROR);

    // only return bookings booked of self user with role (Standard)
    if (Booking.canViewSelfBookings(callerRole, isPartOfSameBusiness, isSelf)) {
      return this.bookingRepository.findAllByBusinessForUser(
        businessId,
        userId,
      );
    }

    return this.bookingRepository.findAllByBusiness(businessId);
  }
}
