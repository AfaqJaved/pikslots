import type { ErrorShape } from '../../shared';

export type TimeOffNotFound = ErrorShape & {
  kind: 'timeoff_not_found';
  by: 'id';
  value?: string;
};
