import { Inject, Injectable } from '@nestjs/common';
import {
  IUserRepository,
  InfrastructureError,
  Result,
  User,
  err,
  ok,
} from '@pikslots/domain';
import type {
  UserNotFoundError,
  UpdateUserAvatarCommand,
  UpdateUserAvatarUseCase,
  UserRepository,
  UnauthorizedError,
} from '@pikslots/domain';
import {
  IPikslotS3Service,
  type PikslotS3Service,
} from 'src/shared/s3/s3.service';
import { SecurityContext } from 'src/shared/security/context/security.context';

@Injectable()
export class UpdateUserAvatarUseCaseImpl implements UpdateUserAvatarUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: UserRepository,
    @Inject(IPikslotS3Service)
    private readonly s3Service: PikslotS3Service,
    private readonly securityContext: SecurityContext,
  ) {}

  async execute(
    command: UpdateUserAvatarCommand,
  ): Promise<
    Result<User, UserNotFoundError | UnauthorizedError | InfrastructureError>
  > {
    const findResult = await this.userRepository.findById(command.userId);
    if (!findResult.ok) return err(findResult.error as InfrastructureError);

    const target = findResult.value;

    if (!target) {
      return err<UserNotFoundError>({
        kind: 'user_not_found',
        by: 'id',
        value: command.userId,
        message: `User not found against ${command.userId}`,
        timestamp: new Date(),
      });
    }

    const callerRole = this.securityContext.role;
    const isSelf = this.securityContext.userId === command.userId;
    const isPartofSameBusiness =
      this.securityContext.businessId === target.businessId;

    if (!User.canUpdateAvatar(callerRole, isSelf, isPartofSameBusiness)) {
      return err<UnauthorizedError>({
        kind: 'unauthorized',
        message: `Can not perform the operation Role ${this.securityContext.role}`,
        timestamp: new Date(),
      });
    }

    const updated = target.updateAvatarUrl(command.avatarKey);

    const updateResult = await this.userRepository.update(updated);

    if (!updateResult.ok) return err(updateResult.error);

    // delete prev avatar once new one is updated
    if (target.avatarUrl !== null) {
      await this.s3Service.deleteFile(target.avatarUrl);
    }

    return ok(updated);
  }
}
