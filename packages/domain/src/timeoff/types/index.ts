export type RecurrenceFrequency =
  | 'Does not repeat' // does not repeat
  | 'Daily'
  | 'Every working day' // every working day (Mon–Fri)
  | 'Weekly'
  | 'Monthly'
  | 'Annually'
  | 'Custom';

export type WeekDays =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type RecurrenceCustom = {
  interval?: number;
  day?: boolean;
  weekly_days?: WeekDays[];
  monthly_week_of_month?: 1 | 2 | 3 | 4 | -1;
  monthly_weekday?: WeekDays;
  repeat_annually?: boolean;
};
