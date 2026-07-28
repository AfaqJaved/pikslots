import { HttpStatus } from '@nestjs/common';
import {
  type InfrastructureError,
  type PublicBookingPageDetailsNotFound,
} from '@pikslots/domain';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';

type PublicBookingPageError =
  | PublicBookingPageDetailsNotFound
  | InfrastructureError;

const errorMap: Record<
  PublicBookingPageError['kind'],
  (error: PublicBookingPageError) => PikslotsBaseErrorResponse
> = {
  booking_page_not_found: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.NOT_FOUND),
  infrastructure: () => {
    return new PikslotsBaseErrorResponse(
      'Something went wrong. Please try again later.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  },
};

export function mapPublicBookingPageError(
  error: PublicBookingPageError,
): PikslotsBaseErrorResponse {
  return errorMap[error.kind](error);
}
