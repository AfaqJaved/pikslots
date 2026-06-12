import { AssignServiceToUsersEvent } from '@pikslots/domain';
import { Job } from 'bullmq';
import { PIKSLOT_EVENTS } from './pikslot.events';

// ── Job name type ─────────────────────────────────────────────────────────────
export type ServiceUserAssignmentJobName =
  (typeof PIKSLOT_EVENTS.SERVICE_USER_ASSIGNMENT)[keyof typeof PIKSLOT_EVENTS.SERVICE_USER_ASSIGNMENT];

// ── Job data map  (name → payload) ────────────────────────────────────────────

export interface ServiceUserAssignmentJobData {
  [PIKSLOT_EVENTS.SERVICE_USER_ASSIGNMENT
    .ASSIGN_SERVICE_TO_USERS]: AssignServiceToUsersEvent;
}

// ── Discriminated union of all service-user-assignment jobs ──────────────────
export type ServiceUserAssignmentJob = {
  [K in ServiceUserAssignmentJobName]: Job<
    ServiceUserAssignmentJobData[K],
    void,
    K
  >;
}[ServiceUserAssignmentJobName];
