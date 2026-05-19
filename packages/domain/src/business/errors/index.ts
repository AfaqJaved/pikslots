import type { ErrorShape } from '../../shared';

/** A business with the same slug or email already exists. @example { kind: 'business_already_exists', message: 'Slug already taken', timestamp, field: 'slug' } */
export type BusinessAlreadyExistsError = ErrorShape & {
  kind: 'business_already_exists';
  field: 'slug' | 'email';
};

/** No business was found for the given lookup value. @example { kind: 'business_not_found', message: 'Business not found by id', timestamp, by: 'id', value: 'f47ac10b-...' } */
export type BusinessNotFoundError = ErrorShape & {
  kind: 'business_not_found';
  by: 'id' | 'slug' | 'ownerId';
  value: string;
};

/** Business account has been suspended by an admin. Access should be blocked until the suspension is lifted. @example { kind: 'business_suspended', message: 'Business suspended: terms violation', timestamp, reason: 'terms violation' } */
export type BusinessSuspendedError = ErrorShape & {
  kind: 'business_suspended';
  reason: string | null;
};

/** Business exists but is not yet active (e.g. pending setup completion). @example { kind: 'business_inactive', message: 'Business is not active', timestamp, status: 'inactive' } */
export type BusinessInactiveError = ErrorShape & {
  kind: 'business_inactive';
  status: 'inactive' | 'pending_setup';
};
