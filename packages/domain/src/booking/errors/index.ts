import type { ErrorShape } from '../../shared';

/**
 * No booking was found for the given lookup value.
 * @example { kind: 'booking_not_found', by: 'id', value: 'bkg_01j...' }
 */
export type BookingNotFoundError = ErrorShape & {
  kind: 'booking_not_found';
  by: 'id';
  value: string;
};

/**
 * The requested time slot overlaps with an existing booking for the same business.
 * @example { kind: 'booking_conflict', startTime: '...', endTime: '...' }
 */
export type BookingConflictError = ErrorShape & {
  kind: 'booking_conflict';
  startTime: string;
  endTime: string;
};
