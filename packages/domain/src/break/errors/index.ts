import type { ErrorShape } from '../../shared';
import type { BreakDay } from '../break.entity';

/**
 * No break was found for the given id.
 *
 * @example { kind: 'break_not_found', message: 'Break not found by id', timestamp, by: 'id', value: 'f47ac10b-...' }
 */
export type BreakNotFoundError = ErrorShape & {
  kind: 'break_not_found';
  by: 'id';
  value: string;
};

/**
 * The new break overlaps in time with an existing break the user already has on that day.
 *
 * @example { kind: 'break_overlap', message: 'Break overlaps with existing break on monday (10:00–11:00)', timestamp, day: 'monday', conflictingStart: '10:00', conflictingEnd: '11:00' }
 */
export type BreakOverlapError = ErrorShape & {
  kind: 'break_overlap';
  day: BreakDay;
  conflictingStart: string;
  conflictingEnd: string;
};

/**
 * The caller does not have permission to delete this break because they do not own it
 * and do not hold a privileged role (Business Owner, Admin, Platform Owner).
 *
 * @example { kind: 'break_not_owned', message: 'You do not have permission to delete this break', timestamp, requesterId: 'abc-123', ownerId: 'xyz-456' }
 */
export type BreakNotOwnedError = ErrorShape & {
  kind: 'break_not_owned';
  requesterId: string;
  ownerId: string;
};
