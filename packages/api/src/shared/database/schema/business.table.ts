import { Selectable, Insertable, Updateable } from 'kysely';
import type { AuditFields } from './audit.table';

export interface BusinessTable extends AuditFields {
  id: string;                          // uuid primary key
  owner_id: string;                    // references users.id (businessOwner role)
  slug: string;                        // unique, URL-friendly tenant identifier e.g. "joes-barbershop"
  name: string;                        // display name of the business
  description: string | null;          // optional short description
  industry: 'salon_and_beauty' | 'health_and_wellness' | 'fitness' | 'medical' | 'education' | 'legal' | 'financial' | 'hospitality' | 'retail' | 'other';
  address: string;                     // physical address
  email: string;                       // unique contact email
  phone: string | null;                // E.164 phone number; optional
  website: string | null;              // public website URL; optional
  logo: string | null;                 // logo image URL; optional
  status: 'pending_setup' | 'active' | 'inactive' | 'suspended'; // account state
  suspended_reason: string | null;     // reason given when business was suspended
  // locale
  default_time_zone: string;           // IANA timezone identifier (e.g. "UTC")
  default_currency: string;            // ISO 4217 currency code (e.g. "USD")
  default_language: string;            // BCP 47 language tag (e.g. "en")
  // booking config
  booking_allow_online: boolean;       // whether online booking is enabled
  booking_requires_confirmation: boolean; // whether staff must manually confirm bookings
  booking_cancellation_window_hours: number; // minimum notice hours required to cancel
  booking_window_days: number;         // how far ahead customers can book
  // subscription
  subscription_plan: 'free' | 'starter' | 'pro' | 'enterprise'; // current plan tier
  subscription_status: 'trialing' | 'active' | 'past_due' | 'cancelled'; // billing state
  trial_ends_at: Date | null;          // when the free trial expires
}

export type BusinessTableSelect = Selectable<BusinessTable>;
export type BusinessTableInsert = Insertable<BusinessTable>;
export type BusinessTableUpdate = Updateable<BusinessTable>;
