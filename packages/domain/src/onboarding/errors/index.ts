import type { ErrorShape } from '../../shared';

/**
 * A Platform Owner already exists, so onboarding cannot create another one.
 * @example { kind: 'platform_owner_already_exist', message: 'A platform owner is already registered', field : email | username timestamp }
 */
export type PlatformOwnerAlreadyExist = ErrorShape & {
  kind: 'platform_owner_already_exist';
  message: 'A platform owner is already registered';
  field: 'email' | 'username';
};

/**
 * A business Owner already exists, so onboarding cannot create another one.
 * @example { kind: 'business', message: 'A business owner is already registered', field : email | username timestamp }
 */

export type businessOwnerAlreadyExist = ErrorShape & {
  kind: 'business_owner_already_exist';
  message: 'A business owner is aready registered';
  field: 'email' | 'username';
};
