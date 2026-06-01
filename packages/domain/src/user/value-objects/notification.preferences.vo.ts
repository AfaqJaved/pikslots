import type { SupportedSoundTypes } from '../types';

export interface NotificationPreferences {
  readonly notificationMode: 'all' | 'focus' | 'none';
  readonly soundEnabled: boolean;
  readonly soundType: SupportedSoundTypes;
}
