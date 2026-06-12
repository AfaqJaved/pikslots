import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import {
  IServiceUserAssignmentRepository,
  ServiceUserAssignment,
} from '@pikslots/domain';
import { PIKSLOT_EVENTS } from 'src/shared/queue/jobs/pikslot.events';
import type {
  AssignServiceToUsersEvent,
  ServiceUserAssignmentRepository,
} from '@pikslots/domain';
import { v7 as uuidv7 } from 'uuid';
import { ServiceUserAssignmentJob } from 'src/shared/queue/jobs';

// (single) service --> assign to --> users (multiple)
@Processor(PIKSLOT_EVENTS.SERVICE_USER_ASSIGNMENT.ASSIGN_SERVICE_TO_USERS)
export class AssignServiceToUsersEventImpl extends WorkerHost {
  constructor(
    @Inject(IServiceUserAssignmentRepository)
    private readonly serviceUserAssignmentRepository: ServiceUserAssignmentRepository,
  ) {
    super();
  }

  async process(job: ServiceUserAssignmentJob): Promise<void> {
    const data = job.data as AssignServiceToUsersEvent;

    // fetch all current (non-deleted) assignments for this service in one query
    const existingResult =
      await this.serviceUserAssignmentRepository.findAllByService(data.serviceId);

    if (!existingResult.ok) throw new Error(JSON.stringify(existingResult.error));

    // build a set of already-assigned user IDs for O(1) lookup
    const existingUserIds = new Set(existingResult.value.map((a) => a.userId));

    // keep only user IDs that don't yet have an assignment for this service
    const newUserIds = data.userIds.filter((id) => !existingUserIds.has(id));

    // nothing new to assign — exit early (idempotent)
    if (newUserIds.length === 0) return;

    const assignments = newUserIds.map((userId) =>
      ServiceUserAssignment.create({
        id: uuidv7(),
        serviceId: data.serviceId,
        userId,
        businessId: data.businessId,
        createdBy: data.assignedBy,
      }),
    );

    const saveResult = await this.serviceUserAssignmentRepository.saveAll(assignments);

    if (!saveResult.ok) throw new Error(JSON.stringify(saveResult.error));
  }
}
