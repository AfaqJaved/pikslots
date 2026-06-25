import { HttpStatus } from '@nestjs/common';
import type {
  BookingConflictError,
  BookingNotFoundError,
  InfrastructureError,
  UnauthorizedError,
} from '@pikslots/domain';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';

type BookingError =
  | BookingNotFoundError
  | BookingConflictError
  | UnauthorizedError
  | InfrastructureError;

const bookingErrorMap: Record<
  BookingError['kind'],
  (error: BookingError) => PikslotsBaseErrorResponse
> = {
  booking_not_found: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.NOT_FOUND),
  booking_conflict: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.CONFLICT),
  unauthorized: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.UNAUTHORIZED),
  infrastructure: () =>
    new PikslotsBaseErrorResponse(
      'Something went wrong. Please try again later.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    ),
};

export function mapBookingError(
  error: BookingError,
): PikslotsBaseErrorResponse {
  console.log(error);
  return bookingErrorMap[error.kind](error);
}
