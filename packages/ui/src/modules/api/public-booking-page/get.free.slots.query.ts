import { USER_ENDPOINTS, type GetFreeSlotsForUserResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { queryOptions } from '@tanstack/svelte-query';
import type { PikslotResponse } from '../common/common-models';
import type { GetFreeSlotsForUser } from './models/public.booking.page.model';

export const getFreeSlotsForUser = async ({
	userId,
	businessId,
	date,
	durationInMins,
	bufferTimeInMins,
	businessTimezone
}: GetFreeSlotsForUser): Promise<GetFreeSlotsForUserResponse> => {
	const url = USER_ENDPOINTS.FREE_SLOTS.replace(':userId', userId);
	const { data } = await apiClient.get<PikslotResponse<GetFreeSlotsForUserResponse>>(url, {
		params: {
			businessId,
			date,
			durationInMins,
			bufferTimeInMins,
			businessTimezone
		}
	});
	return data.data;
};

export const getFreeSlotsForUserQueryOptions = (input: GetFreeSlotsForUser) => {
	return queryOptions({
		queryKey: ['booking-page-details', input],
		queryFn: () => getFreeSlotsForUser(input)
	});
};
