import { Processor, WorkerHost } from '@nestjs/bullmq';
import { PIKSLOT_EVENTS, BusinessJob } from 'src/shared/queue/jobs';
import { BusinessRegistrationInviteEvent } from '@pikslots/domain';
import { PikslotEmailService } from 'src/shared/email/pikslot.email.service';

@Processor(PIKSLOT_EVENTS.BUSINESS.BUSINESS_REGISTRATION_INVITE)
export class BusinessRegistrationInvite extends WorkerHost {
  constructor(private readonly emailService: PikslotEmailService) {
    super();
  }

  async process(job: BusinessJob): Promise<void> {
    const data: BusinessRegistrationInviteEvent = job.data;

    const result = await this.emailService.sendEmail({
      to: data.businessOwnerEmail,
      subject: 'Welcome to Pikslots',
      template: 'business-invite',
      context: {
        firstName: data.businessOnwerName,
        businessName: data.businessName,
        acceptUrl: data.inviteURL,
      },
    });

    if (!result.ok) throw new Error(result.error.message);
  }
}
