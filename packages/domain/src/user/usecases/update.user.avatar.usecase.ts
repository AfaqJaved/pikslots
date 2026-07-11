import { type UnauthorizedError, type InfrastructureError, type Result } from '../../shared';
import type { UserNotFoundError } from '../errors';
import type { User } from '../user.entity';

export interface UpdateUserAvatarCommand {
  userId: string;
  avatarKey: string;
}

export const IUpdateUserAvatarUseCase = Symbol('IUpdateUserAvatarUseCase');

export interface UpdateUserAvatarUseCase {
  execute(
    command: UpdateUserAvatarCommand,
  ): Promise<Result<User, UserNotFoundError | UnauthorizedError | InfrastructureError>>;
}
