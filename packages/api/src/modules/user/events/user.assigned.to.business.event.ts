import { Processor, WorkerHost } from '@nestjs/bullmq';
import { UserJob } from 'src/shared/queue/jobs';
import { IUserRepository, UserAssignedToBusinessEvent } from '@pikslots/domain';
import { PIKSLOT_EVENTS } from 'src/shared/queue/jobs/pikslot.events';
import { Inject } from '@nestjs/common';
import type { UserRepository } from '@pikslots/domain';

@Processor(PIKSLOT_EVENTS.USER.USER_ASSIGN_TO_BUSINESS)
export class UserAssignedToBusinessEventImpl extends WorkerHost {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: UserRepository,
  ) {
    super();
  }

  async process(job: UserJob): Promise<void> {
    const data: UserAssignedToBusinessEvent = job.data;
    const userFoundResult = await this.userRepository.findById(data.userId);

    if (!userFoundResult.ok)
      throw new Error(JSON.stringify(userFoundResult.error));

    if (!userFoundResult.value)
      throw new Error('User not found against id ' + data.userId);

    const updated = userFoundResult.value.assignBusiness(
      data.businessId,
      data.userId,
    );

    const updateResult = await this.userRepository.update(updated);

    if (!updateResult.ok) throw new Error(JSON.stringify(updateResult.error));
  }
}
