import type { WeekDay } from '../types';

export interface DayHours {
  enabled: boolean;
  openTime: string; // 'HH:mm' 24-hour, e.g. '09:00'
  closeTime: string; // 'HH:mm' 24-hour, e.g. '17:00'
}

export type BusinessHours = Record<WeekDay, DayHours>;
