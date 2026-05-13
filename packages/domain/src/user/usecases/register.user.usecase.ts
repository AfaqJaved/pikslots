import type { InfrastructureError, Result } from '../../shared';
import type { UserAlreadyExistsError } from '../errors';
import type { UserRole } from '../user.entity';

export interface RegisterUserCommand {
  username: string;
  email: string;
  password: string;
  phone?: string;
  name: { firstName: string; lastName: string };
  role: UserRole;
  timezone: string;
}

export const IRegisterUseCase = Symbol('IRegisterUseCase');

export interface RegisterUserUseCase {
  execute(
    command: RegisterUserCommand,
  ): Promise<Result<{ message: 'success' }, UserAlreadyExistsError | InfrastructureError>>;
}
