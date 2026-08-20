import { Business, User } from '@pikslots/domain';
import { domainAuditToPersistence } from 'src/shared/database/mapper/audit.fields.mapper';
import { BusinessTableSelect } from 'src/shared/database/schema/business.table';
import { UserTableSelect } from 'src/shared/database/schema/user.table';

export class OnboardingPresistenceMapper {
  public userToPresistence(user: User): UserTableSelect {
    return {
      id: user.id,
      username: user.username,
      business_id: user.businessId,
      password: user.password,
      first_name: user.name.firstName,
      last_name: user.name.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      avatar_url: user.avatarUrl,
      email_verified: user.emailVerified,
      booking_url: user.bookingUrl,
      notification_mode: user.notificationPreferences.notificationMode,
      notification_sound_enabled: user.notificationPreferences.soundEnabled,
      notification_sound_type: user.notificationPreferences.soundType,
      reminder_enabled: user.appointmentReminders.reminderEnabled,
      reminder_mins_before: user.appointmentReminders.reminderMinutesBefore,
      reminder_sound_type: user.appointmentReminders.reminderSoundType,
      last_login_at: user.lastLoginAt,
      suspended_reason: user.suspendedReason,
      user_working_hours: user.userWorkingHours,
      ...domainAuditToPersistence(user),
    };
  }
  public businessToPresistence(business: Business): BusinessTableSelect {
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
      business_links: business.businessLinks,
      contact_details: business.contactDetails,
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
