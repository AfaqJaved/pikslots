import type { ErrorShape } from '../../shared';

/** A user with the same email or username already exists. @example { kind: 'user_already_exists', message: 'Email already registered', timestamp, field: 'email' } */
export type UserAlreadyExistsError = ErrorShape & {
  kind: 'user_already_exists';
  field: 'email' | 'username';
};

/** No user was found for the given lookup value. @example { kind: 'user_not_found', message: 'User not found by id', timestamp, by: 'id', value: 'f47ac10b-...' } */
export type UserNotFoundError = ErrorShape & {
  kind: 'user_not_found';
  by: 'id' | 'email' | 'username' | 'email or username';
  value: string;
};

/** User account has been suspended by an admin. Access should be blocked until the suspension is lifted. @example { kind: 'user_suspended', message: 'Account suspended: repeated policy violations', timestamp, reason: 'repeated policy violations' } */
export type UserSuspendedError = ErrorShape & {
  kind: 'user_suspended';
  reason: string | null;
};

/** User account exists but is not yet active (e.g. pending email verification). @example { kind: 'user_inactive', message: 'Account is not active', timestamp, status: 'pending_verification' } */
export type UserInactiveError = ErrorShape & {
  kind: 'user_inactive';
  status: 'inactive';
};
