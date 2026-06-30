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
 * Converts a Unix timestamp in milliseconds to a UTC ISO 8601 string.
 * The inverse of `isoToMillis`.
 *
 * @param ms - Milliseconds since Unix epoch, e.g. 1750082400000
 * @returns ISO 8601 UTC string, e.g. "2025-06-16T14:00:00.000Z"
 */
export function millisToIso(ms: number): string {
  return DateTime.fromMillis(ms, { zone: 'utc' }).toISO()!;
}
