import type { InfrastructureError, Result } from '../../shared';
import type { ServiceSummary } from '../read-models';

export const IFindServicesByGroupUseCase = Symbol('IFindServicesByGroupUseCase');

export interface FindServicesByGroupUseCase {
  execute(serviceGroupId: string): Promise<Result<ServiceSummary[], InfrastructureError>>;
}
