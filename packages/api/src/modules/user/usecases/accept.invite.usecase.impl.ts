import { Inject, Injectable } from '@nestjs/common';
import {
  IUserRepository,
  InfrastructureError,
  Result,
  err,
  ok,
} from '@pikslots/domain';
import type {
  AcceptInviteCommand,
  AcceptInviteUseCase,
  InviteAlreadyAcceptedError,
  InvalidOtpError,
  UserNotFoundError,
  UserRepository,
} from '@pikslots/domain';
import { OtpService } from 'src/shared/cache/otp/otp.service';
import { PikslotEmailService } from 'src/shared/email/pikslot.email.service';
import { PasswordHashingService } from 'src/shared/security/hashing/password.hashing.service';

@Injectable()
export class AcceptInviteUseCaseImpl implements AcceptInviteUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: UserRepository,
    private readonly otpService: OtpService,
    private readonly passwordHashingService: PasswordHashingService,
  ) {}

  async execute(
    command: AcceptInviteCommand,
  ): Promise<
    Result<
      { message: 'success' },
      | UserNotFoundError
      | InviteAlreadyAcceptedError
      | InvalidOtpError
      | InfrastructureError
    >
  > {
    const findResult = await this.userRepository.findById(command.userId);
    if (!findResult.ok) return err(findResult.error as InfrastructureError);

    const user = findResult.value;
    if (!user) {
      return err<UserNotFoundError>({
        kind: 'user_not_found',
        by: 'id',
        value: command.userId,
        message: `User not found: ${command.userId}`,
        timestamp: new Date(),
      });
    }

    if (user.status !== 'invited') {
      return err<InviteAlreadyAcceptedError>({
        kind: 'invite_already_accepted',
        status: user.status,
        message: 'This invite has already been accepted.',
        timestamp: new Date(),
      });
    }

    const otpValid = await this.otpService.verify(
      `invite:otp:${command.userId}`,
      command.otp,
    );

    if (!otpValid) {
      return err<InvalidOtpError>({
        kind: 'invalid_otp',
        message: 'The code you entered is incorrect or has expired.',
        timestamp: new Date(),
      });
    }

    const hashedPassword = await this.passwordHashingService.hash(
      command.newPassword,
    );

    const activated = user.acceptInvite(hashedPassword, command.userId);

    const updateResult = await this.userRepository.update(activated);

    if (!updateResult.ok) return err(updateResult.error);

    return ok({ message: 'success' });
  }
}
