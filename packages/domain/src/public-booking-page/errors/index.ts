import type { ErrorShape } from '../../shared';

export type PublicBookingPageDetailsNotFound = ErrorShape & {
  kind: 'booking_page_not_found';
  by: 'businessSlug';
  value: string;
};
