import { Job } from 'bullmq';
import { PIKSLOT_EVENTS } from './pikslot.events';
import { UserAssignedToBusinessEvent } from '@pikslots/domain';
// ── Job name type ─────────────────────────────────────────────────────────────
export type UserJobName =
  (typeof PIKSLOT_EVENTS.USER)[keyof typeof PIKSLOT_EVENTS.USER];

// ── Job data map  (name → payload) ────────────────────────────────────────────

export interface UserAssingToBusinessJobData {
  [PIKSLOT_EVENTS.USER.USER_ASSIGN_TO_BUSINESS]: UserAssignedToBusinessEvent;
}

// ── Discriminated union of all user jobs ──────────────────────────────────────
// Use this as the type for `job` inside a WorkerHost processor.
export type UserJob = {
  [K in UserJobName]: Job<UserAssingToBusinessJobData[K], void, K>;
}[UserJobName];
