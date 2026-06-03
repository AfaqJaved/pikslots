import { Inject, Injectable } from '@nestjs/common';
import {
  IUserRepository,
  InfrastructureError,
  Result,
  err,
  ok,
} from '@pikslots/domain';
import type {
  InviteAlreadyAcceptedError,
  RequestInviteOtpCommand,
  RequestInviteOtpUseCase,
  UnauthorizedError,
  UserNotFoundError,
  UserRepository,
} from '@pikslots/domain';
import { InviteJwtPayload } from '@pikslots/shared';
import { OtpService } from 'src/shared/cache/otp/otp.service';
import { PikslotEmailService } from 'src/shared/email/pikslot.email.service';
import { JwtInviteService } from 'src/shared/security/jwt/jwt.invite.service';

const UNAUTHORIZED_ERROR: UnauthorizedError = {
  kind: 'unauthorized',
  message: 'Otp Request in unauthorized',
  timestamp: new Date(),
};

@Injectable()
export class RequestInviteOtpUseCaseImpl implements RequestInviteOtpUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: UserRepository,
    private readonly otpService: OtpService,
    private readonly emailService: PikslotEmailService,
    private readonly jwtInviteService: JwtInviteService,
  ) {}

  async execute(
    command: RequestInviteOtpCommand,
  ): Promise<
    Result<
      { message: 'success' },
      | UnauthorizedError
      | UserNotFoundError
      | InviteAlreadyAcceptedError
      | InfrastructureError
    >
  > {
    const tokenResult =
      this.jwtInviteService.verifyInviteToken<InviteJwtPayload>(command.token);

    if (!tokenResult.ok) return err(UNAUTHORIZED_ERROR);

    const { userId, businessId } = tokenResult.value;

    const findResult = await this.userRepository.findById(userId);

    if (!findResult.ok) return err(findResult.error as InfrastructureError);

    const user = findResult.value;

    if (!user) {
      return err<UserNotFoundError>({
        kind: 'user_not_found',
        by: 'id',
        value: userId,
        message: `User not found: ${userId}`,
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

    const otp = await this.otpService.generate(`invite:otp:${userId}`);

    const emailResult = await this.emailService.sendEmail({
      to: user.email,
      subject: 'Your Pikslots verification code',
      template: 'otp',
      context: {
        firstName: user.name.firstName,
        otp,
        otpExpiryInMins: 5,
      },
    });

    if (!emailResult.ok) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to send OTP email. Please try again.',
        timestamp: new Date(),
        cause: 'Failed to send OTP email',
      });
    }

    return ok({ message: 'success' });
  }
}
