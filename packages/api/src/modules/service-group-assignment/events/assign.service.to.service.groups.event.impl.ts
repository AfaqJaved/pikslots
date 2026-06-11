import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import {
  IServiceGroupAssignmentRepository,
  ServiceGroupAssignment,
} from '@pikslots/domain';
import { PIKSLOT_EVENTS } from 'src/shared/queue/jobs/pikslot.events';
import type {
  AssignServiceToServiceGroupsEvent,
  ServiceGroupAssignmentRepository,
} from '@pikslots/domain';
import { v7 as uuidv7 } from 'uuid';
import { ServiceGroupAssignmentJob } from 'src/shared/queue/jobs';

// (single) service --> assign to --> service groups (multiple)
@Processor(
  PIKSLOT_EVENTS.SERVICE_GROUP_ASSIGNMENT.ASSIGN_SERVICE_TO_SERVICE_GROUPS,
)
export class AssignServiceToServiceGroupsEventImp extends WorkerHost {
  constructor(
    @Inject(IServiceGroupAssignmentRepository)
    private readonly serviceGroupAssignmentRepository: ServiceGroupAssignmentRepository,
  ) {
    super();
  }

  async process(job: ServiceGroupAssignmentJob): Promise<void> {
    // extract the typed event payload from the BullMQ job
    const data = job.data as AssignServiceToServiceGroupsEvent;

    // fetch all current (non-deleted) assignments for this service in one query
    const existingResult =
      await this.serviceGroupAssignmentRepository.findAllByService(
        data.serviceId,
      );

    // propagate infrastructure failure so BullMQ can retry the job
    if (!existingResult.ok)
      throw new Error(JSON.stringify(existingResult.error));

    // build a set of already-assigned group IDs for O(1) lookup
    const existingGroupIds = new Set(
      existingResult.value.map((a) => a.serviceGroupId),
    );

    // keep only group IDs that don't yet have an assignment for this service
    const newGroupIds = data.serviceGroupIds.filter(
      (id) => !existingGroupIds.has(id),
    );

    // nothing new to assign — exit early (idempotent)
    if (newGroupIds.length === 0) return;

    // shared timestamp so all assignments in this batch appear created together
    const now = new Date();

    // construct one ServiceGroupAssignment entity per new group
    const assignments = newGroupIds.map((serviceGroupId) =>
      ServiceGroupAssignment.create({
        id: uuidv7(), // generate a new UUID v7 for each assignment
        serviceId: data.serviceId,
        serviceGroupId,
        businessId: data.businessId,
        createdBy: data.assignedBy,
        createdAt: now,
        updatedAt: now,
        updatedBy: data.assignedBy,
        deletedAt: null, // not deleted
        deletedBy: null, // not deleted
        isDeleted: false, // active record
      }),
    );

    // persist all new assignments in a single bulk INSERT
    const saveResult =
      await this.serviceGroupAssignmentRepository.saveAll(assignments);

    // propagate persistence failure so BullMQ can retry the job
    if (!saveResult.ok) throw new Error(JSON.stringify(saveResult.error));
  }
}
