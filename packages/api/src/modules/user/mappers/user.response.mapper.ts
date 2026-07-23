import type { User } from '@pikslots/domain';
import type { UserSummary } from '@pikslots/shared';
import type { PikslotS3Service } from 'src/shared/s3/s3.service';

export class UserResponseMapper {
  static async toUserSummary(
    u: User,
    s3Service: PikslotS3Service,
  ): Promise<UserSummary> {
    const avatarUrl =
      u.avatarUrl !== null
        ? await s3Service.getPresignedDownloadUrl(u.avatarUrl)
        : null;

    return {
      id: u.id,
      username: u.username,
      email: u.email,
      name: { firstName: u.name.firstName, lastName: u.name.lastName },
      phone: u.phone,
      role: u.role,
      status: u.status,
      avatarUrl,
      emailVerified: u.emailVerified,
      bookingUrl: u.bookingUrl,
      businessId: u.businessId,
      lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
      suspendedReason: u.suspendedReason,
      notificationPreferences: {
        notificationMode: u.notificationPreferences.notificationMode,
        soundEnabled: u.notificationPreferences.soundEnabled,
        soundType: u.notificationPreferences.soundType,
      },
      appointmentReminders: {
        reminderEnabled: u.appointmentReminders.reminderEnabled,
        reminderMinutesBefore: u.appointmentReminders.reminderMinutesBefore,
        reminderSoundType: u.appointmentReminders.reminderSoundType,
      },
      userWorkingHours: {
        monday: u.userWorkingHours.monday,
        tuesday: u.userWorkingHours.tuesday,
        wednesday: u.userWorkingHours.wednesday,
        thursday: u.userWorkingHours.thursday,
        friday: u.userWorkingHours.friday,
        saturday: u.userWorkingHours.saturday,
        sunday: u.userWorkingHours.sunday,
      },
    };
  }
}
