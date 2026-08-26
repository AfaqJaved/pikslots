import { BOOKING_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { queryOptions } from '@tanstack/svelte-query';
import type { FindAllBookingsByBusinessForUserResponse } from '@pikslots/shared';
import type { PikslotResponse } from '../common/common-models';

export const getBookingsByBusinessForUser = async (
	businessId: string,
	userId: string
): Promise<FindAllBookingsByBusinessForUserResponse> => {
	const url = BOOKING_ENDPOINTS.FIND_ALL_BY_BUSINESS_FOR_USER.replace(
		':businessId',
		businessId
	).replace(':userId', userId);
	const { data } =
		await apiClient.get<PikslotResponse<FindAllBookingsByBusinessForUserResponse>>(url);
	return data.data;
};

export const getBookingsByBusinessForUserQueryOptions = (businessId: string, userId: string) =>
	queryOptions({
		queryKey: ['bookings-by-business-for-user', businessId, userId],
		queryFn: () => getBookingsByBusinessForUser(businessId, userId)
	});
