import type { InfrastructureError, Result } from '../../shared';
import type { User } from '../user.entity';

export const IGetAllBusinessOwnersUseCase = Symbol('IGetAllBusinessOwnersUseCase');

export interface GetAllBusinessOwnersUseCase {
  execute(): Promise<Result<User[], InfrastructureError>>;
}
