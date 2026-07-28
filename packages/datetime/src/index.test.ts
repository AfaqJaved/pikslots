import { describe, expect, it } from 'vitest';
import {
  diffInCalendarDays,
  formatIsoInTimezone,
  getCurrentTimeInUTC,
  getWeekDay,
  isoToMillis,
  millisToIso,
  utcIsoToTimezone,
  workingHourToUTC,
} from './index';

describe('getCurrentTimeInUTC', () => {
  it('returns a UTC ISO 8601 string ending in Z', () => {
    const result = getCurrentTimeInUTC();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('is close to the actual current time', () => {
    const before = Date.now();
    const result = getCurrentTimeInUTC();
    const after = Date.now();
    const resultMs = new Date(result).getTime();
    expect(resultMs).toBeGreaterThanOrEqual(before);
    expect(resultMs).toBeLessThanOrEqual(after);
  });
});

describe('getWeekDay', () => {
  it('returns the lowercase weekday name for a given date', () => {
    expect(getWeekDay('2025-06-16')).toBe('monday');
    expect(getWeekDay('2025-06-17')).toBe('tuesday');
    expect(getWeekDay('2025-06-22')).toBe('sunday');
  });

  it('treats the date as UTC regardless of local timezone', () => {
    expect(getWeekDay('2025-01-01')).toBe('wednesday');
  });
});

describe('workingHourToUTC', () => {
  it('converts a local time on a given date to UTC', () => {
    // America/New_York is UTC-4 in June (EDT)
    expect(workingHourToUTC('2025-06-16', '09:00', 'America/New_York')).toBe(
      '2025-06-16T13:00:00.000Z',
    );
  });

  it('handles a timezone with a positive UTC offset', () => {
    // Asia/Karachi is UTC+5
    expect(workingHourToUTC('2025-06-16', '09:00', 'Asia/Karachi')).toBe(
      '2025-06-16T04:00:00.000Z',
    );
  });

  it('correctly handles DST transitions', () => {
    // America/New_York is UTC-5 in January (EST, no DST)
    expect(workingHourToUTC('2025-01-16', '09:00', 'America/New_York')).toBe(
      '2025-01-16T14:00:00.000Z',
    );
    // America/New_York is UTC-4 in June (EDT)
    expect(workingHourToUTC('2025-06-16', '09:00', 'America/New_York')).toBe(
      '2025-06-16T13:00:00.000Z',
    );
  });
});

describe('isoToMillis', () => {
  it('parses a UTC ISO string into milliseconds since epoch', () => {
    expect(isoToMillis('2025-06-16T14:00:00.000Z')).toBe(1750082400000);
  });

  it('round-trips with millisToIso', () => {
    const iso = '2025-06-16T14:00:00.000Z';
    expect(millisToIso(isoToMillis(iso))).toBe(iso);
  });
});

describe('millisToIso', () => {
  it('converts a Unix timestamp in milliseconds to a UTC ISO string', () => {
    expect(millisToIso(1750082400000)).toBe('2025-06-16T14:00:00.000Z');
  });

  it('round-trips with isoToMillis', () => {
    const ms = 1750082400000;
    expect(isoToMillis(millisToIso(ms))).toBe(ms);
  });
});

describe('utcIsoToTimezone', () => {
  it('converts a UTC ISO string to the equivalent local time with offset', () => {
    expect(utcIsoToTimezone('2025-06-16T14:00:00.000Z', 'America/New_York')).toBe(
      '2025-06-16T10:00:00.000-04:00',
    );
  });

  it('handles a positive UTC offset timezone', () => {
    expect(utcIsoToTimezone('2025-06-16T04:00:00.000Z', 'Asia/Karachi')).toBe(
      '2025-06-16T09:00:00.000+05:00',
    );
  });

  it('rolls over to the previous/next calendar day when the offset crosses midnight', () => {
    expect(utcIsoToTimezone('2025-06-16T02:00:00.000Z', 'America/New_York')).toBe(
      '2025-06-15T22:00:00.000-04:00',
    );
  });
});

describe('formatIsoInTimezone', () => {
  it('formats using the default format when none is provided', () => {
    expect(formatIsoInTimezone('2025-06-16T14:00:00.000Z', 'America/New_York')).toBe('16 Jun 2025');
  });

  it('formats using a custom format string', () => {
    expect(formatIsoInTimezone('2025-06-16T14:00:00.000Z', 'America/New_York', 'HH:mm')).toBe(
      '10:00',
    );
  });

  it('shifts the date across the day boundary for the target timezone', () => {
    expect(formatIsoInTimezone('2025-06-16T02:00:00.000Z', 'America/New_York', 'd MMM yyyy')).toBe(
      '15 Jun 2025',
    );
  });
});

describe('diffInCalendarDays', () => {
  it('returns 1 when start and end fall on the same calendar day', () => {
    expect(diffInCalendarDays('2025-06-16T14:00:00.000Z', '2025-06-16T20:00:00.000Z', 'UTC')).toBe(
      1,
    );
  });

  it('returns 2 for two consecutive UTC calendar days when the timezone does not pull them back together', () => {
    expect(diffInCalendarDays('2025-06-16T22:00:00.000Z', '2025-06-17T02:00:00.000Z', 'UTC')).toBe(
      2,
    );
  });

  it('collapses to 1 when the timezone offset pulls both instants onto the same local day', () => {
    // Both instants land on 16 June in America/New_York (UTC-4), despite
    // being on different UTC calendar days.
    expect(
      diffInCalendarDays(
        '2025-06-16T22:00:00.000Z',
        '2025-06-17T02:00:00.000Z',
        'America/New_York',
      ),
    ).toBe(1);
  });

  it('ignores time-of-day and counts only calendar dates in the given timezone', () => {
    // In UTC these are the same day; in America/New_York the first one lands on the previous day.
    expect(
      diffInCalendarDays(
        '2025-06-16T02:00:00.000Z',
        '2025-06-16T23:00:00.000Z',
        'America/New_York',
      ),
    ).toBe(2);
  });

  it('counts across multiple days inclusively', () => {
    expect(diffInCalendarDays('2025-06-16T00:00:00.000Z', '2025-06-20T00:00:00.000Z', 'UTC')).toBe(
      5,
    );
  });
});
