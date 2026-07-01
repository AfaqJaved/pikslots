// import type { BreakDay } from '@pikslots/domain';
export type BreakDay =
  | 'monday' | 'tuesday' | 'wednesday'
  | 'thursday' | 'friday' | 'saturday' | 'sunday';

// --- Requests ---

export interface CreateBreakInput {
  day: BreakDay;
  startTime: string; // 'HH:MM'
  endTime: string;   // 'HH:MM'
}

export interface UpdateBreakInput {
  startTime: string; // 'HH:MM'
  endTime: string;   // 'HH:MM'
}

// --- Responses ---

export interface BreakSummary {
  id: string;
  userId: string;
  day: BreakDay;
  startTime: string;
  endTime: string;
  createdAt: string;
}