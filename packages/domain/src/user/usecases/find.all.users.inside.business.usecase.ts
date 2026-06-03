import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { User } from '../user.entity';

export const IFindAllUsersInsideBusinessUseCase = Symbol('IFindAllUsersInsideBusinessUseCase');

export interface FindAllUsersInsideBusinessUseCase {
  execute(userId: string): Promise<Result<User[], UnauthorizedError | InfrastructureError>>;
}
