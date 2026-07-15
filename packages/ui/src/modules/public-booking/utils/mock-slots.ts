import { getWeekDay, workingHourToUTC, isoToMillis, millisToIso } from '@pikslots/datetime';
import type { BusinessHours } from '@pikslots/shared';
import type { PublicSlot } from '../types';

export interface GenerateMockSlotsInput {
	date: string; // 'YYYY-MM-DD'
	businessHours: BusinessHours;
	timeZone: string;
	durationInMins: number;
	bufferTimeInMins: number;
}

/**
 * Generates slots in the exact `SlotResponse` shape the real
 * `GET /users/free-slots/:userId` endpoint returns, so this can be swapped for
 * a real query later without touching any component that consumes it.
 */
export function generateMockSlots({
	date,
	businessHours,
	timeZone,
	durationInMins,
	bufferTimeInMins
}: GenerateMockSlotsInput): PublicSlot[] {
	const weekday = getWeekDay(date) as keyof BusinessHours;
	const day = businessHours[weekday];
	if (!day.enabled) return [];

	const stepMs = (durationInMins + bufferTimeInMins) * 60_000;
	const dayStartMs = isoToMillis(workingHourToUTC(date, day.openTime, timeZone));
	const dayEndMs = isoToMillis(workingHourToUTC(date, day.closeTime, timeZone));
	const nowMs = Date.now();

	const slots: PublicSlot[] = [];
	let index = 0;
	for (let startMs = dayStartMs; startMs + durationInMins * 60_000 <= dayEndMs; startMs += stepMs, index++) {
		if (startMs < nowMs) continue;
		// Deterministically "book out" every 4th slot so the grid isn't unrealistically full.
		if (index % 4 === 3) continue;

		slots.push({
			startTime: millisToIso(startMs),
			endTime: millisToIso(startMs + durationInMins * 60_000)
		});
	}

	return slots;
}
