import type { Result } from '../../shared/result';
import type { InfrastructureError } from '../../shared';
import type { UserAlreadyExistsError, UserNotFoundError } from '../errors';
import type { User } from '../user.entity';

export interface UserRepository {
  save(user: User): Promise<Result<void, UserAlreadyExistsError | InfrastructureError>>;
  findById(id: string): Promise<Result<User | null, UserNotFoundError | InfrastructureError>>;
  findByEmail(email: string): Promise<Result<User | null, UserNotFoundError | InfrastructureError>>;
  findByUsername(
    username: string,
  ): Promise<Result<User | null, UserNotFoundError | InfrastructureError>>;
  existsByEmail(email: string): Promise<Result<boolean, InfrastructureError>>;
  existsByUsername(username: string): Promise<Result<boolean, InfrastructureError>>;
}

export const IUserRepository = Symbol('IUserRepository');
