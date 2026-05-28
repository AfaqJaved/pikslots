import type { Job } from 'bullmq';
import type { UserInvitedEvent } from '@pikslots/domain';
import { PIKSLOT_EVENTS } from './jobs/index';

// ── Job name type ─────────────────────────────────────────────────────────────

export type UserJobName = (typeof PIKSLOT_EVENTS.USER)[keyof typeof PIKSLOT_EVENTS.USER];

// ── Job data map  (name → payload) ────────────────────────────────────────────

export interface UserJobDataMap {
  [PIKSLOT_EVENTS.USER.USER_INVITED]: UserInvitedEvent;
}

// ── Discriminated union of all user jobs ──────────────────────────────────────
// Use this as the type for `job` inside a WorkerHost processor.

export type UserJob = {
  [K in UserJobName]: Job<UserJobDataMap[K], void, K>;
}[UserJobName];
