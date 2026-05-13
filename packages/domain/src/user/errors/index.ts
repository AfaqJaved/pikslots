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
