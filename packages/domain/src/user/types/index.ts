// ── Enums ─────────────────────────────────────────────────────────────────────

/**
 * Defines the access level of a user within the platform.
 *
 * ┌─────────────────┬──────────────────────────────────────────────────────────────────┐
 * │ Role            │ Permissions                                                      │
 * ├─────────────────┼──────────────────────────────────────────────────────────────────┤
 * │ Platform Owner  │ Full access to all businesses on the platform                    │
 * │ Business Owner  │ Full access to their own business only                           │
 * │ No Access       │ Cannot log in — calendar is managed by Enhanced/Admin users      │
 * │ Standard        │ Can manage their own calendar only                               │
 * │ Enhanced        │ Can manage all team member calendars + customer profiles         │
 * │ Admin           │ Enhanced permissions + ability to manage all account settings    │
 * └─────────────────┴──────────────────────────────────────────────────────────────────┘
 */
export type UserRole =
  | 'Platform Owner'
  | 'Business Owner'
  | 'No Access'
  | 'Standard'
  | 'Enhanced'
  | 'Admin';

export type UserStatus = 'invited' | 'active' | 'inactive' | 'suspended';
export type SupportedSoundTypes = 'chime' | 'whistle';
