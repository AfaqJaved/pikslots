import type { RecurrenceCustom, RecurrenceFrequency, WeekDays } from '../types';

export type recurrenceType = 'standard' | 'custom';

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  // custom
  custom: RecurrenceCustom;
  // weekly
  weekly_day?: WeekDays;
  // monthly
  monthly_week_of_month?: 1 | 2 | 3 | 4 | -1;
  monthly_weekday?: WeekDays;
  // annually
  annually_month?: number; // 1-12 (6 = June)
  annually_day?: number; // 1-31 (22)
  // never means never stop untill manually
  // on means repeat untill that date comes
  // after means repeat this only this number of times and then stops
  end?: 'never' | 'on' | 'after';
  on?: Date;
  after?: number;
}

export interface recurrenceDomain {
  recurrenceType: recurrenceType;
  recurrenceRule: RecurrenceRule;
}
export interface recurrencePresistence {
  recurrence_type: recurrenceType;
  rruleString: string | null;
}
