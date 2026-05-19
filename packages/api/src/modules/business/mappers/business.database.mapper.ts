import { Business } from '@pikslots/domain';
import {
  domainAuditToPersistence,
  persistenceAuditToDomain,
} from 'src/shared/database/mapper/audit.fields.mapper';
import {
  BusinessTableInsert,
  BusinessTableSelect,
} from 'src/shared/database/schema/business.table';

export class BusinessPersistenceMapper {
  public persistenceToDomain(row: BusinessTableSelect): Business {
    return Business.reconstitute({
      id: row.id,
      ownerId: row.owner_id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      industry: row.industry,
      address: row.address,
      email: row.email,
      phone: row.phone,
      website: row.website,
      logo: row.logo,
      status: row.status,
      suspendedReason: row.suspended_reason,
      defaultTimeZone: row.default_time_zone,
      defaultCurrency: row.default_currency,
      defaultLanguage: row.default_language,
      bookingSettings: {
        allowOnlineBooking: row.booking_allow_online,
        requiresConfirmation: row.booking_requires_confirmation,
        cancellationWindowHours: row.booking_cancellation_window_hours,
        bookingWindowDays: row.booking_window_days,
      },
      subscriptionPlan: row.subscription_plan,
      subscriptionStatus: row.subscription_status,
      trialEndsAt: row.trial_ends_at,
      ...persistenceAuditToDomain(row),
    });
  }

  public domainToPersistence(business: Business): BusinessTableInsert {
    return {
      id: business.id,
      owner_id: business.ownerId,
      slug: business.slug,
      name: business.name,
      description: business.description,
      industry: business.industry,
      address: business.address,
      email: business.email,
      phone: business.phone,
      website: business.website,
      logo: business.logo,
      status: business.status,
      suspended_reason: business.suspendedReason,
      default_time_zone: business.defaultTimeZone,
      default_currency: business.defaultCurrency,
      default_language: business.defaultLanguage,
      booking_allow_online: business.bookingSettings.allowOnlineBooking,
      booking_requires_confirmation:
        business.bookingSettings.requiresConfirmation,
      booking_cancellation_window_hours:
        business.bookingSettings.cancellationWindowHours,
      booking_window_days: business.bookingSettings.bookingWindowDays,
      subscription_plan: business.subscriptionPlan,
      subscription_status: business.subscriptionStatus,
      trial_ends_at: business.trialEndsAt,
      ...domainAuditToPersistence(business),
    };
  }
}
