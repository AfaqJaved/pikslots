import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  InfrastructureError,
  InviteUserCommand,
  InviteUserUseCase,
  InviterNotAuthorizedError,
  IUserRepository,
  ok,
  Result,
  User,
  UserAlreadyExistsError,
} from '@pikslots/domain';
import type { UserRepository } from '@pikslots/domain';
import { Queue } from 'bullmq';
import { PIKSLOT_EVENTS } from 'src/shared/queue/jobs';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class InviteUserUsecaseImpl implements InviteUserUseCase {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: UserRepository,
    private readonly securityContext: SecurityContext,
    // @InjectQueue(PIKSLOT_EVENTS.USER.USER_INVITED) private events: Queue,
  ) {}

  async execute(
    command: InviteUserCommand,
  ): Promise<
    Result<
      { message: 'success' },
      UserAlreadyExistsError | InviterNotAuthorizedError | InfrastructureError
    >
  > {
    const inviterRole = this.securityContext.role;

    if (!User.canInviteRole(inviterRole, command.role))
      return err<InviterNotAuthorizedError>({
        kind: 'inviter_not_authorized',
        message: `Role '${inviterRole}' is not allowed to invite users with role '${command.role}'`,
        inviterRole: this.securityContext.role,
        attemptedRole: command.role,
        timestamp: new Date(),
      });

    const emailExists = await this.userRepository.existsByEmail(command.email);

    if (!emailExists.ok) return err(emailExists.error);
    if (emailExists.value) {
      return err<UserAlreadyExistsError>({
        kind: 'user_already_exists',
        message: 'A user with this email already exists',
        field: 'email',
        timestamp: new Date(),
      });
    }

    const usernameExists = await this.userRepository.existsByUsername(
      command.username,
    );
    if (!usernameExists.ok) return err(usernameExists.error);
    if (usernameExists.value) {
      return err<UserAlreadyExistsError>({
        kind: 'user_already_exists',
        message: 'A user with this username already exists',
        field: 'username',
        timestamp: new Date(),
      });
    }

    const user: User = User.create({
      id: uuidv7(),
      username: command.username,
      password: '', // set by the user when accepting the invite
      name: command.name,
      email: command.email,
      phone: command.phone,
      role: command.role,
      businessId: null,
      bookingUrl: '', // TODO: generate booking url
      createdBy: this.securityContext.userId, // the id of the logged in user acting as inviter
    });

    const saved = await this.userRepository.save(user);
    if (!saved.ok) return err(saved.error);

    // await this.events.add(PIKSLOT_EVENTS.USER.USER_INVITED, {
    //   userId: user.id,
    //   userEmail: user.email,
    //   firstName: user.name.firstName,
    //   lastName: user.name.lastName,
    //   role: user.role,
    // });
    return ok({ message: 'success' });
  }
}
