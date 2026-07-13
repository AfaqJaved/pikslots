import { DateTime } from 'luxon';

/**
 * Returns the current time as a UTC ISO 8601 string.
 *
 * @returns e.g. "2025-06-16T14:30:00.000Z"
 */
export function getCurrentTimeInUTC(): string {
  return DateTime.utc().toISO()!;
}

/**
 * Returns the lowercase weekday name for a given date string.
 *
 * @param date - 'YYYY-MM-DD'
 * @returns e.g. "monday" | "tuesday" | ... | "sunday"
 */
export function getWeekDay(date: string): string {
  return DateTime.fromISO(date, { zone: 'utc' }).weekdayLong!.toLowerCase();
}

/**
 * Converts a working hour boundary (HH:mm local time) on a given date to a UTC ISO 8601 string.
 * Correctly handles DST transitions.
 *
 * @param date     - 'YYYY-MM-DD'
 * @param time     - 'HH:mm' (24-hour)
 * @param timezone - IANA timezone, e.g. 'America/New_York'
 * @returns ISO 8601 UTC string, e.g. "2025-06-16T13:00:00.000Z"
 */
export function workingHourToUTC(date: string, time: string, timezone: string): string {
  return DateTime.fromISO(`${date}T${time}`, { zone: timezone }).toUTC().toISO()!;
}

/**
 * Parses a UTC ISO 8601 string and returns the equivalent Unix timestamp in milliseconds.
 * Pinned to UTC so the result is never affected by the server's local timezone.
 *
 * @param isoString - ISO 8601 UTC string, e.g. "2025-06-16T14:00:00.000Z"
 * @returns Milliseconds since Unix epoch, e.g. 1750082400000
 */
export function isoToMillis(isoString: string): number {
  return DateTime.fromISO(isoString, { zone: 'utc' }).toMillis();
}

/**
 * Converts a UTC ISO 8601 string to the equivalent local time in the given
 * timezone, returned as an ISO 8601 string (with the timezone offset, not Z).
 *
 * @param isoString - UTC ISO 8601 string, e.g. "2025-06-16T14:00:00.000Z"
 * @param timezone  - IANA timezone, e.g. "America/New_York"
 * @returns ISO 8601 string in the target timezone, e.g. "2025-06-16T10:00:00.000-04:00"
 */
export function utcIsoToTimezone(isoString: string, timezone: string): string {
  return DateTime.fromISO(isoString, { zone: 'utc' }).setZone(timezone).toISO()!;
}

/**
 * Converts a Unix timestamp in milliseconds to a UTC ISO 8601 string.
 * The inverse of `isoToMillis`.
 *
 * @param ms - Milliseconds since Unix epoch, e.g. 1750082400000
 * @returns ISO 8601 UTC string, e.g. "2025-06-16T14:00:00.000Z"
 */
export function millisToIso(ms: number): string {
  return DateTime.fromMillis(ms, { zone: 'utc' }).toISO()!;
}

/**
 * Formats a UTC ISO 8601 string as a human-readable date/time in the given timezone.
 * Generic display formatter usable for any UTC timestamp (time off, bookings, breaks, etc).
 *
 * @param isoString - UTC ISO 8601 string, e.g. "2025-06-16T14:00:00.000Z"
 * @param timezone  - IANA timezone, e.g. "America/New_York"
 * @param format    - Luxon format tokens, defaults to "d MMM yyyy", e.g. "16 Jun 2025"
 * @returns the formatted date/time string in the target timezone
 */
export function formatIsoInTimezone(
  isoString: string,
  timezone: string,
  format: string = 'd MMM yyyy',
): string {
  return DateTime.fromISO(isoString, { zone: 'utc' }).setZone(timezone).toFormat(format);
}

/**
 * Counts the inclusive number of calendar days between two UTC ISO 8601 strings
 * in the given timezone, ignoring the time-of-day component entirely.
 * e.g. same calendar date for start and end => 1.
 *
 * @param startIsoString - UTC ISO 8601 string, e.g. "2025-06-16T22:00:00.000Z"
 * @param endIsoString   - UTC ISO 8601 string, e.g. "2025-06-17T02:00:00.000Z"
 * @param timezone       - IANA timezone, e.g. "America/New_York"
 * @returns inclusive count of calendar days, e.g. 2
 */
export function diffInCalendarDays(
  startIsoString: string,
  endIsoString: string,
  timezone: string,
): number {
  const start = DateTime.fromISO(startIsoString, { zone: 'utc' }).setZone(timezone).startOf('day');
  const end = DateTime.fromISO(endIsoString, { zone: 'utc' }).setZone(timezone).startOf('day');
  return Math.round(end.diff(start, 'days').days) + 1;
}
