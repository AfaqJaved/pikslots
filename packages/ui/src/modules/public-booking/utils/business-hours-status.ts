import type { BusinessHours } from '@pikslots/shared';
import { WEEKDAYS, fromHHmm, type WeekdayKey } from '$utils/working-hours';

const WEEKDAY_ABBREVIATIONS: Record<WeekdayKey, string> = {
	sunday: 'Sun',
	monday: 'Mon',
	tuesday: 'Tue',
	wednesday: 'Wed',
	thursday: 'Thu',
	friday: 'Fri',
	saturday: 'Sat'
};

export interface BusinessHoursStatus {
	isOpenNow: boolean;
	label: string;
}

/** '09:00' -> '9 AM', '09:30' -> '9:30 AM' */
function formatHourLabel(hhmm: string): string {
	return fromHHmm(hhmm).replace(':00 ', ' ');
}

function toMinutes(hhmm: string): number {
	const [h, m] = hhmm.split(':').map(Number);
	return h * 60 + m;
}

/** Returns the current weekday key and minutes-since-midnight in the given IANA timezone. */
export function getNowInTimezone(
	timeZone: string,
	now: Date = new Date()
): { weekday: WeekdayKey; minutesSinceMidnight: number } {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone,
		weekday: 'long',
		hour: '2-digit',
		minute: '2-digit',
		hourCycle: 'h23'
	}).formatToParts(now);

	const weekday = parts.find((p) => p.type === 'weekday')!.value.toLowerCase() as WeekdayKey;
	const hour = Number(parts.find((p) => p.type === 'hour')!.value);
	const minute = Number(parts.find((p) => p.type === 'minute')!.value);

	return { weekday, minutesSinceMidnight: hour * 60 + minute };
}

export function getTodayKey(timeZone: string, now: Date = new Date()): WeekdayKey {
	return getNowInTimezone(timeZone, now).weekday;
}

export function getTimezoneLongName(timeZone: string, now: Date = new Date()): string {
	const parts = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'long' }).formatToParts(
		now
	);
	return parts.find((p) => p.type === 'timeZoneName')?.value ?? timeZone;
}

/**
 * Computes "Open · Closes 5 PM" / "Closed · Opens 9 AM Wed" style status,
 * mirroring the Setmore business-hours widget.
 */
export function getBusinessHoursStatus(
	businessHours: BusinessHours,
	timeZone: string,
	now: Date = new Date()
): BusinessHoursStatus {
	const { weekday: todayKey, minutesSinceMidnight } = getNowInTimezone(timeZone, now);
	const todayIndex = WEEKDAYS.indexOf(todayKey);

	const today = businessHours[todayKey];
	if (
		today.enabled &&
		minutesSinceMidnight >= toMinutes(today.openTime) &&
		minutesSinceMidnight < toMinutes(today.closeTime)
	) {
		return { isOpenNow: true, label: `Open · Closes ${formatHourLabel(today.closeTime)}` };
	}

	// Walk forward (today included, for a later opening time today) to find the next open slot.
	for (let offset = 0; offset < 7; offset++) {
		const dayKey = WEEKDAYS[(todayIndex + offset) % 7];
		const day = businessHours[dayKey];
		if (!day.enabled) continue;

		const isLaterToday = offset === 0 && toMinutes(day.openTime) > minutesSinceMidnight;
		if (offset === 0 && !isLaterToday) continue;

		return {
			isOpenNow: false,
			label: `Closed · Opens ${formatHourLabel(day.openTime)} ${WEEKDAY_ABBREVIATIONS[dayKey]}`
		};
	}

	return { isOpenNow: false, label: 'Closed' };
}
