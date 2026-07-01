import { RecurrenceRule, recurrenceType, WeekDays } from '@pikslots/domain';
import { RRule, Options } from 'rrule';
import { WeekDayMap } from './timeoff.build.rrulestring.helper';

/** Maps an rrule numeric weekday (0=Mon..6=Sun) back to our WeekDays union. */
export const ReverseWeekDayMap: Record<number, WeekDays> = Object.entries(
  WeekDayMap,
).reduce(
  (acc, [day, weekday]) => {
    acc[weekday.weekday] = day as WeekDays;
    return acc;
  },
  {} as Record<number, WeekDays>,
);

/** Normalizes a value that may be a single item or an array*/
function toArray<T>(val: T | T[] | null | undefined): T[] {
  if (val == null) return [];
  return Array.isArray(val) ? val : [val];
}

/** Valid "week of month" positions supported by rrule (1st-4th, or last). */
function isMonthlyWeek(value: number) {
  return (
    value === 1 || value === 2 || value === 3 || value === 4 || value === -1
  );
}

/** Convenience shape for the fields we pull out of RRule.Options. */
interface ParsedRRuleFields {
  freq: Options['freq'];
  interval: number;
  weekdays: WeekDays[];
  bysetpos: number[];
  bymonth: number[];
  bymonthday: number[];
}

function parseRRuleOptions(options: Options): ParsedRRuleFields {
  return {
    freq: options.freq,
    interval: options.interval ?? 1,
    weekdays: toArray(options.byweekday)
      .map((n) => ReverseWeekDayMap[n as unknown as number])
      .filter(Boolean),
    bysetpos: toArray(options.bysetpos),
    bymonth: toArray(options.bymonth),
    bymonthday: toArray(options.bymonthday),
  };
}

/** Determines the `frequency` + related fields for a "standard" recurrence rule. */
function buildStandardFrequency(
  fields: ParsedRRuleFields,
): Partial<RecurrenceRule> | null {
  const { freq, interval, weekdays, bysetpos, bymonth, bymonthday } = fields;

  const isEveryWorkingDay =
    freq === RRule.WEEKLY && interval === 1 && weekdays.length >= 5;

  if (isEveryWorkingDay) {
    return { frequency: 'Every working day' };
  }

  if (freq === RRule.DAILY && interval === 1) {
    return { frequency: 'Daily' };
  }

  if (freq === RRule.WEEKLY && interval === 1 && weekdays.length <= 1) {
    return { frequency: 'Weekly', weekly_day: weekdays[0] };
  }

  if (
    freq === RRule.MONTHLY &&
    interval === 1 &&
    bysetpos.length === 1 &&
    weekdays.length <= 1
  ) {
    return {
      frequency: 'Monthly',
      monthly_weekday: weekdays[0],
      ...(isMonthlyWeek(bysetpos[0]) && {
        monthly_week_of_month: bysetpos[0],
      }),
    };
  }

  if (
    freq === RRule.YEARLY &&
    interval === 1 &&
    bymonth.length === 1 &&
    bymonthday.length === 1
  ) {
    return {
      frequency: 'Annually',
      annually_month: bymonth[0],
      annually_day: bymonthday[0],
    };
  }

  return null;
}

/** Determines the `frequency` + `custom` fields for a "custom" recurrence rule. */
function buildCustomFrequency(
  fields: ParsedRRuleFields,
): Partial<RecurrenceRule> {
  const { freq, interval, weekdays, bysetpos } = fields;

  const custom: RecurrenceRule['custom'] = { interval };

  if (freq === RRule.WEEKLY && weekdays.length >= 1) {
    custom.weekly_days = weekdays;
  } else if (
    freq === RRule.MONTHLY &&
    bysetpos.length === 1 &&
    weekdays.length === 1 &&
    isMonthlyWeek(bysetpos[0])
  ) {
    custom.monthly_week_of_month = bysetpos[0];
    custom.monthly_weekday = weekdays[0];
  } else if (freq === RRule.YEARLY) {
    custom.repeat_annually = true;
  }

  return { frequency: 'Custom', custom };
}

/** Reconstructs the `end` field (never / on / after) from rruleString until/count. */
function buildEndCondition(
  options: Options,
): Pick<RecurrenceRule, 'end' | 'on' | 'after'> {
  if (options.until) {
    return { end: 'on', on: options.until };
  }
  if (options.count) {
    return { end: 'after', after: options.count };
  }
  return { end: 'never' };
}

/**
 * Reconstructs a domain `RecurrenceRule` from an RRULE string.
 */
export function buildRecurrenceObject(
  rruleString: string,
  recurrence_type: recurrenceType,
): RecurrenceRule {
  const { options } = RRule.fromString(rruleString);
  const fields = parseRRuleOptions(options);

  const frequencyFields =
    recurrence_type === 'standard'
      ? buildStandardFrequency(fields)
      : buildCustomFrequency(fields);

  const recurrenceRule: RecurrenceRule = {
    ...frequencyFields,
    ...buildEndCondition(options),
  } as RecurrenceRule;

  return recurrenceRule;
}
