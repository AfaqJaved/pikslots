import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { BusinessJob } from 'src/shared/queue/jobs';
import {
  BusinessRegistrationInviteEvent,
  UserAssignedToBusinessEvent,
} from '@pikslots/domain';
import { PikslotEmailService } from 'src/shared/email/pikslot.email.service';
import { PIKSLOT_EVENTS } from 'src/shared/queue/jobs/pikslot.events';
import { Queue } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor(PIKSLOT_EVENTS.BUSINESS.BUSINESS_REGISTRATION_INVITE)
export class BusinessRegistrationInvite extends WorkerHost {
  private logger: Logger = new Logger(BusinessRegistrationInvite.name);
  constructor(
    @InjectQueue(PIKSLOT_EVENTS.USER.USER_ASSIGN_TO_BUSINESS)
    private events: Queue<
      UserAssignedToBusinessEvent,
      void,
      typeof PIKSLOT_EVENTS.USER.USER_ASSIGN_TO_BUSINESS
    >,
    private readonly emailService: PikslotEmailService,
  ) {
    super();
  }

  async process(job: BusinessJob): Promise<void> {
    const data: BusinessRegistrationInviteEvent = job.data;

    const result = await this.emailService.sendEmail({
      to: data.businessOwnerEmail,
      subject: 'Welcome to Pikslots',
      template: 'user-invite',
      context: {
        firstName: data.businessOnwerName,
        businessName: data.businessName,
        acceptUrl: data.inviteURL,
      },
    });

    if (!result.ok) throw new Error(result.error.message);

    const payload: UserAssignedToBusinessEvent = {
      userId: data.businessOwnerId,
      businessId: data.businessId,
    };

    this.logger.debug('Event executed successfully');
    await this.events.add(PIKSLOT_EVENTS.USER.USER_ASSIGN_TO_BUSINESS, payload);
  }
}
