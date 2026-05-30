import { Selectable, Insertable, Updateable } from 'kysely';
import type {
  BusinessIndustry,
  BusinessStatus,
  SubscriptionPlan,
  SubscriptionStatus,
  BrandDetails,
  BrandApperanceDetails,
  LocationDetails,
  BookingPolicies,
  BookingSetup,
  BookingContactFields,
  BookingCustomization,
  BookingLabelOverrides,
  BusinessHours,
  BusinessTeamNotifications,
  BusinessCustomerNotifications,
  BusinessNotificationCustomization,
} from '@pikslots/domain';

import type { AuditFields } from './audit.table';

export interface BusinessTable extends AuditFields {
  id: string; // uuid primary key
  owner_id: string; // references users.id (businessOwner role)
  slug: string; // unique URL-friendly tenant identifier e.g. "joes-barbershop"
  name: string; // display name of the business
  industry: BusinessIndustry; // business category
  about: string; // free-text description of the business
  appear_in_search_results: boolean; // whether the business is discoverable in search
  status: BusinessStatus; // account lifecycle state
  suspended_reason: string | null; // reason provided when account was suspended

  // settings
  brand_detail: BrandDetails; // banner and logo image URLs
  brand_appearance_details: BrandApperanceDetails; // color, button shape, theme, gallery photos
  location_details: LocationDetails; // address, city, state, zip, country, currency, timezone, language
  booking_policies: BookingPolicies; // lead time, schedule window, cancellation policy, policy text
  booking_setup: BookingSetup; // section visibility flags and booking behaviour toggles
  booking_contact_fields: BookingContactFields; // which contact fields are shown and required at booking
  booking_customization: BookingCustomization; // language, time format, week start, display toggles
  booking_label_overrides: BookingLabelOverrides; // custom labels for services, team members, fields, T&Cs, redirect
  business_hours: BusinessHours; // per-day open/close times and enabled flags

  // notifications
  team_notifications: BusinessTeamNotifications; // team-facing notification preferences and CC emails
  customer_notifications: BusinessCustomerNotifications; // customer-facing notification preferences
  notification_customization: BusinessNotificationCustomization; // email sender name and signature

  // subscription
  subscription_plan: SubscriptionPlan; // current billing plan tier
  subscription_status: SubscriptionStatus; // current billing state
  trial_ends_at: Date | null; // when the free trial expires; null if not on trial
}

export type BusinessTableSelect = Selectable<BusinessTable>;
export type BusinessTableInsert = Insertable<BusinessTable>;
export type BusinessTableUpdate = Updateable<BusinessTable>;
