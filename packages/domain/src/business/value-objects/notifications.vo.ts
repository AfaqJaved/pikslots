import type { NotificationType, TimeUnit } from '../types';

export interface BusinessTeamNotifications {
  notifyBookingConfirmation: boolean;
  notifyBookingChanges: boolean;
  notifyBookingCancellations: boolean;
  bookingRemindersTime: {
    active: boolean;
    type: NotificationType;
    unit: TimeUnit;
    value: number;
  };
  extraCCEmails: string[];
}

export interface BusinessCustomerNotifications {
  notifyBookingConfirmation: boolean;
  notifyBookingChanges: boolean;
  notifyBookingCancellations: boolean;
  bookingRemindersTime: {
    active: boolean;
    type: NotificationType;
    unit: TimeUnit;
    value: number;
  };
}

export interface BusinessNotificationCustomization {
  emailSenderName: string;
  emailSignature: string;
}
