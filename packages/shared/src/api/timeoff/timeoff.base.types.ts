import type { RecurrenceCustom, RecurrenceFrequency, WeekDays } from './types';

type monthlyweek = 1 | 2 | 3 | 4 | -1;

export interface RecurrenceDomain {
  frequency: RecurrenceFrequency;
  custom: RecurrenceCustom;
  monthly_week_of_the_month?: monthlyweek;
  monthly_weekday?: WeekDays;
  annually_month?: number;
  annually_day?: number;
  end?: 'never' | 'on' | 'after';
  on?: Date;
  after?: number;
}

export interface RecurrenceDomainCustom {
  interval?: number;
  day?: boolean;
  weekly_days?: WeekDays[];
  monthly_week_of_month?: 1 | 2 | 3 | 4 | -1;
  monthly_weekday?: WeekDays;
  repeat_annually?: boolean;
}

export enum RecurrenceEnd {
  NEVER = 'never',
  ON = 'on',
  AFTER = 'after',
}

export enum RecurencyFrequencyEnum {
  DOES_NOT_REPEAT = 'Does not repeat',
  DAILY = 'Daily',
  EVERY_WORKING_DAY = 'Every working day', // every working day (Mon–Fri)
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
  ANNUALLY = 'Annually',
  CUSTOM = 'Custom',
}

export enum weekday {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}
