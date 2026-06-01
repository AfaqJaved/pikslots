import { BusinessRegistrationInviteEvent } from '@pikslots/domain';
import { Job } from 'bullmq';

export const PIKSLOT_EVENTS = {
  BUSINESS: {
    BUSINESS_REGISTRATION_INVITE: 'business.registration.invite',
  },
} as const;

// ── Job name type ─────────────────────────────────────────────────────────────
export type BusinessJobName =
  (typeof PIKSLOT_EVENTS.BUSINESS)[keyof typeof PIKSLOT_EVENTS.BUSINESS];

// ── Job data map  (name → payload) ────────────────────────────────────────────

export interface BusinessRegistrationInviteJobData {
  [PIKSLOT_EVENTS.BUSINESS
    .BUSINESS_REGISTRATION_INVITE]: BusinessRegistrationInviteEvent;
}

// ── Discriminated union of all user jobs ──────────────────────────────────────
// Use this as the type for `job` inside a WorkerHost processor.
export type BusinessJob = {
  [K in BusinessJobName]: Job<BusinessRegistrationInviteJobData[K], void, K>;
}[BusinessJobName];
