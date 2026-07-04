import type { ErrorShape } from '../../shared';

/**
 * No timeoff was found for the given lookup value.
 * @example { kind: 'timeofff_not_found', by: 'id', value: '...' }
 */
export type TimeOffNotFound = ErrorShape & {
  kind: 'timeoff_not_found';
  by: 'id';
  value: string | null;
};
