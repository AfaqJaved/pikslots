import { RecurrenceRule, WeekDays } from '@pikslots/domain';
import { Frequency, Options, RRule, Weekday } from 'rrule';

export const WeekDayMap: Record<WeekDays, Weekday> = {
  monday: RRule.MO,
  tuesday: RRule.TU,
  wednesday: RRule.WE,
  thursday: RRule.TH,
  friday: RRule.FR,
  saturday: RRule.SA,
  sunday: RRule.SU,
};

export function buildRRule(
  recurrenceObj: RecurrenceRule,
  start_date: Date,
): string | null {
  const rule = recurrenceObj;

  // ___________ not repeat___________________
  if (rule.frequency == 'Does not repeat') return null;
  const options: Partial<Options> = {};
  options.dtstart = new Date(start_date);

  // ________Everyworkingday_________________________
  if (rule.frequency === 'Every working day') {
    options.freq = RRule.WEEKLY;
    options.byweekday = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR];
  }

  //  ______custom with identify unit day/weekly/monthly/yearly __________
  if (rule.frequency === 'Custom') {
    options.interval =
      rule.custom.interval && rule.custom.interval > 0
        ? rule.custom.interval
        : 1;

    if (rule.custom.weekly_days?.length) {
      options.freq = Frequency.WEEKLY;
      options.byweekday = rule.custom.weekly_days.map((day) => WeekDayMap[day]);
    } else if (
      rule.custom.monthly_week_of_month &&
      rule.custom.monthly_weekday
    ) {
      options.freq = Frequency.MONTHLY;
      options.byweekday = [WeekDayMap[rule.custom.monthly_weekday]];
      options.bysetpos = rule.custom.monthly_week_of_month;
    } else if (rule.custom.repeat_annually) {
      options.freq = Frequency.YEARLY;
    } else {
      options.freq = Frequency.DAILY;
    }
  }

  // _______weeklyday_____________
  if (rule.frequency === 'Weekly') {
    options.freq = Frequency.WEEKLY;
    if (rule.weekly_day) {
      options.byweekday = [WeekDayMap[rule.weekly_day]];
    }
  }

  // ________monthlyweek + weekday ____________________
  if (rule.frequency === 'Monthly') {
    options.freq = Frequency.MONTHLY;
    if (rule.monthly_week_of_month && rule.monthly_weekday) {
      options.byweekday = [WeekDayMap[rule.monthly_weekday]];
      options.bysetpos = rule.monthly_week_of_month;
    }
  }
  //__________annuallymonth + annyuallyday___________________
  if (rule.frequency === 'Annually') {
    options.freq = Frequency.YEARLY;
    if (rule.annually_month && rule.annually_day) {
      options.bymonth = rule.annually_month;
      options.bymonthday = rule.annually_day;
    }
  }
  // ________daily_________________
  if (rule.frequency == 'Daily') {
    options.freq = Frequency.DAILY;
  }
  // ______endrepeat_________________________________
  if (rule.end === 'on' && rule.on) {
    options.until = rule.on;
  }

  if (rule.end === 'after' && rule.after) {
    options.count = rule.after;
  }
  return new RRule(options).toString();
}
