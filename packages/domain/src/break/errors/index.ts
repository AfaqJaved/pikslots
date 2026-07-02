import type { ErrorShape } from '../../shared';

/**
 * No break was found for the given lookup value.
 * @example { kind: 'break_not_found', by: 'id', value: 'brk_01j...' }
 */
export type BreakNotFoundError = ErrorShape & {
  kind: 'break_not_found';
  by: 'id' | 'userId';
  value: string;
};

/**
 * The requested break time overlaps with an existing break for the same user on the same day.
 * @example { kind: 'break_conflict', day: 'monday', startTime: '12:00', endTime: '13:00' }
 */
export type BreakConflictError = ErrorShape & {
  kind: 'break_conflict';
  day: string;
  startTime: string;
  endTime: string;
};
