import type { InfrastructureError, Result } from '../../shared';
import type { User } from '../user.entity';
import type { RoleQueryNotAuthorizedError } from '../errors';
import type { UserRole } from '../types';

export const IGetAllUsersByRole = Symbol('IGetAllUsersByRole');

export interface GetAllUsersByRoleUseCase {
  execute(
    callerRole: UserRole,
    targetRole: UserRole,
  ): Promise<Result<User[], InfrastructureError | RoleQueryNotAuthorizedError>>;
}
