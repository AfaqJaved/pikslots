import type { Result, InfrastructureError } from '../../shared';
import type { Break } from '../break.entity';

export const IFindBreaksByUserUseCase = Symbol('IFindBreaksByUserUseCase');

export interface FindBreaksByUserUseCase {
  execute(userId: string): Promise<Result<Break[], InfrastructureError>>;
}
