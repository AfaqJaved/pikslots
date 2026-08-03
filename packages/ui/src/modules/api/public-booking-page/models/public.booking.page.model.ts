import type { GetAvailableDatesForBookingInput } from '@pikslots/shared';

export type GetAvailableDates = GetAvailableDatesForBookingInput & { userId: string };
