import { Selectable, Insertable, Updateable } from 'kysely';
import type { AuditFields } from './audit.table';

export interface UserTable extends AuditFields {
  id: string; // uuid primary key
  username: string; // unique login handle
  password: string; // bcrypt-hashed password
  first_name: string; // given name
  last_name: string; // family name
  email: string; // unique email address
  phone: string | null; // E.164 phone number; optional
  role: 'superAdmin' | 'businessOwner' | 'locationOwner'; // access role
  status: 'pending_verification' | 'active' | 'inactive' | 'suspended'; // account state
  timezone: string; // IANA timezone identifier (e.g. "UTC")
  avatar_url: string | null; // profile picture URL; optional
  email_verified: boolean; // whether the email has been confirmed
  notification_email: boolean; // opt-in for email notifications
  notification_sms: boolean; // opt-in for SMS notifications
  notification_push: boolean; // opt-in for push notifications
  last_login_at: Date | null; // timestamp of most recent login
  suspended_reason: string | null; // reason given when account was suspended
}

export type UserTableSelect = Selectable<UserTable>;
export type UserTableInsert = Insertable<UserTable>;
export type UserTableUpdate = Updateable<UserTable>;
