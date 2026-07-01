import type { InfrastructureError, Result } from '../../shared';
import type { Timeoff } from '../timeoff.entity';

export const IFindAllTime0ffByUserUseCase = Symbol('IFindAllTimeoffByUserUseCase');

export interface FindAllTimeOffByUserUseCase {
  execute(command: string): Promise<Result<Timeoff[] | null, InfrastructureError>>;
}
