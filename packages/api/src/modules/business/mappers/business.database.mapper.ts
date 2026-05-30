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
      industry: row.industry,
      about: row.about,
      appearInSearchResults: row.appear_in_search_results,
      status: row.status,
      suspendedReason: row.suspended_reason,
      brandDetail: row.brand_detail,
      brandApperanceDetails: row.brand_appearance_details,
      locationDetails: row.location_details,
      businessHours: row.business_hours,
      bookingPolicies: row.booking_policies,
      bookingSetup: row.booking_setup,
      bookingContactFields: row.booking_contact_fields,
      bookingCustomization: row.booking_customization,
      bookingLabelOverrides: row.booking_label_overrides,
      teamNotifications: row.team_notifications,
      customerNotifications: row.customer_notifications,
      notificationCustomization: row.notification_customization,
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
      industry: business.industry,
      about: business.about,
      appear_in_search_results: business.appearInSearchResults,
      status: business.status,
      suspended_reason: business.suspendedReason,
      brand_detail: business.brandDetail,
      brand_appearance_details: business.brandApperanceDetails,
      location_details: business.locationDetails,
      business_hours: business.businessHours,
      booking_policies: business.bookingPolicies,
      booking_setup: business.bookingSetup,
      booking_contact_fields: business.bookingContactFields,
      booking_customization: business.bookingCustomization,
      booking_label_overrides: business.bookingLabelOverrides,
      team_notifications: business.teamNotifications,
      customer_notifications: business.customerNotifications,
      notification_customization: business.notificationCustomization,
      subscription_plan: business.subscriptionPlan,
      subscription_status: business.subscriptionStatus,
      trial_ends_at: business.trialEndsAt,
      ...domainAuditToPersistence(business),
    };
  }
}
