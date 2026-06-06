import type { ErrorShape } from '../../shared';

/** A service with the same title already exists for this business.
 * @example { kind: 'service_already_exists', message: 'A service named "Haircut" already exists', timestamp, field: 'title' }
 */
export type ServiceAlreadyExistsError = ErrorShape & {
  kind: 'service_already_exists';
  field: 'title';
};

/** No service was found for the given lookup value.
 * @example { kind: 'service_not_found', message: 'Service not found by id', timestamp, by: 'id', value: 'svc_01j...' }
 */
export type ServiceNotFoundError = ErrorShape & {
  kind: 'service_not_found';
  by: 'id' | 'businessId';
  value: string;
};
