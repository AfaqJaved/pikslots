import { MailerService } from '@nestjs-modules/mailer';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { PIKSLOT_EVENTS, UserJob } from 'src/shared/queue/jobs';

@Processor(PIKSLOT_EVENTS.USER.USER_INVITED)
export class UserInvitedEvent extends WorkerHost {
  private readonly logger: Logger = new Logger(UserInvitedEvent.name);
  constructor(private readonly mailerService: MailerService) {
    super();
  }

  async process(job: UserJob): Promise<void> {
    switch (job.name) {
      case PIKSLOT_EVENTS.USER.USER_INVITED: {
        const user = job.data;
        this.logger.log(`Sending welcome email to ${user.userEmail}`);
        await this.mailerService.sendMail({
          to: user.userEmail,
          subject: `You're invited to Pikslots`,
          template: 'welcome',
          context: {
            firstName: user.firstName,
            email: user.userEmail,
            role: user.role,
            acceptUrl: `${process.env.FRONTEND_URL}/accept-invite?userId=${user.userId}`,
          },
        });
        this.logger.log(`Welcome email sent to ${user.userEmail}`);
        break;
      }
    }
  }
}
