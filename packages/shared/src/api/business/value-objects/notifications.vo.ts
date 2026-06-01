import type { NotificationType, TimeUnit } from '../types';

export interface TeamNotifications {
  notifyBookingConfirmation: boolean;
  notifyBookingChanges: boolean;
  notifyBookingCancellations: boolean;
  bookingRemindersTime: { active: boolean; type: NotificationType; unit: TimeUnit; value: number };
  extraCCEmails: string[];
}

export interface CustomerNotifications {
  notifyBookingConfirmation: boolean;
  notifyBookingChanges: boolean;
  notifyBookingCancellations: boolean;
  bookingRemindersTime: { active: boolean; type: NotificationType; unit: TimeUnit; value: number };
}

export interface NotificationCustomization {
  emailSenderName: string;
  emailSignature: string;
}
