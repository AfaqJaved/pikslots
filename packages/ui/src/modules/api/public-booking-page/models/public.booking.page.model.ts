import type { GetAvailableDatesForBookingInput, GetFreeSlotsForUserInput } from '@pikslots/shared';

export type GetAvailableDates = GetAvailableDatesForBookingInput & { userId: string };
export type GetFreeSlotsForUser = GetFreeSlotsForUserInput & { userId: string };
