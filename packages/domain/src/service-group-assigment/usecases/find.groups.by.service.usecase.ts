import type { InfrastructureError, Result } from '../../shared';
import type { ServiceGroupSummary } from '../read-models/service.group.summary';

export const IFindGroupsByServiceUseCase = Symbol('IFindGroupsByServiceUseCase');

export interface FindGroupsByServiceUseCase {
  execute(serviceId: string): Promise<Result<ServiceGroupSummary[], InfrastructureError>>;
}
