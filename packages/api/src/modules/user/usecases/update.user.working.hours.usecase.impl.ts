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
  WorkingHoursUpdateNotAuthorizedError,
  UpdateUserWorkingHoursCommand,
  UpdateUserWorkingHoursUseCase,
  UserRepository,
} from '@pikslots/domain';
import { SecurityContext } from 'src/shared/security/context/security.context';

@Injectable()
export class UpdateUserWorkingHoursUseCaseImpl implements UpdateUserWorkingHoursUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: UserRepository,
    private readonly securityContext: SecurityContext,
  ) {}

  async execute(
    command: UpdateUserWorkingHoursCommand,
  ): Promise<
    Result<
      User,
      | UserNotFoundError
      | WorkingHoursUpdateNotAuthorizedError
      | InfrastructureError
    >
  > {
    const callerId = this.securityContext.userId;
    const callerRole = this.securityContext.role;
    const callerBusinessId = this.securityContext.businessId;

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

    const isSelf = callerId === command.userId;
    const isPartofSameBusiness = callerBusinessId === target.businessId;

    if (!User.canUpdateWorkingHours(callerRole, isSelf, isPartofSameBusiness)) {
      return err<WorkingHoursUpdateNotAuthorizedError>({
        kind: 'working_hours_update_not_authorized',
        updaterRole: callerRole,
        targetRole: target.role,
        message: `Role '${callerRole}' is not allowed to update working hours for role '${target.role}'`,
        timestamp: new Date(),
      });
    }

    const updated = target.updateWorkingHours({
      userWorkingHours: command.userWorkingHours,
      updatedBy: callerId,
    });

    const updateResult = await this.userRepository.update(updated);
    if (!updateResult.ok)
      return err(updateResult.error as UserNotFoundError | InfrastructureError);

    return ok(updated);
  }
}
