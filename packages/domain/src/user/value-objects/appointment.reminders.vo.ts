import type { SupportedSoundTypes } from '../types';

export interface AppointmentReminders {
  reminderEnabled: boolean;
  reminderMinutesBefore: number;
  reminderSoundType: SupportedSoundTypes;
}
