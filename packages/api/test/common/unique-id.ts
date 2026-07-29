import { randomUUID } from 'node:crypto';

/** A short, human-readable, collision-safe string for slugs/usernames/emails in real-infra tests. */
export function unique(prefix: string): string {
  return `${prefix}-${Date.now()}-${randomUUID().slice(0, 8)}`;
}
