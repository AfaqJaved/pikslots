import { USER_ENDPOINTS, type GetAvailableDatesForBookingResponse } from '@pikslots/shared';
import type { GetAvailableDates } from './models/public.booking.page.model';
import { apiClient } from '$lib/http/axios';
import type { PikslotResponse } from '../common/common-models';
import { queryOptions } from '@tanstack/svelte-query';

const getAvailableDatesForBooking = async (
	command: GetAvailableDates
): Promise<GetAvailableDatesForBookingResponse> => {
	const url = USER_ENDPOINTS.AVAILABLE_DATES.replace(':userId', command.userId);
	const { data } = await apiClient.post<PikslotResponse<GetAvailableDatesForBookingResponse>>(url, {
		businessId: command.businessId,
		serviceId: command.serviceId,
		businessTimezone: command.businessTimezone
	});
	return data.data;
};

export const getAvailableDatesQueryOptions = (values: GetAvailableDates) => {
	return queryOptions({
		queryKey: ['get-available-dates', values],
		queryFn: () => getAvailableDatesForBooking(values)
	});
};
