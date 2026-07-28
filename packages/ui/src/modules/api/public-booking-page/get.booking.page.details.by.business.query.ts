import { PUBLIC_BOOKING_PAGE_ENDPOINTS, type PublicBookingPageDetails } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { queryOptions } from '@tanstack/svelte-query';
import type { PikslotResponse } from '../common/common-models';

export const getBookingPageDetails = async (slug: string): Promise<PublicBookingPageDetails> => {
	const url = PUBLIC_BOOKING_PAGE_ENDPOINTS.GET_PUBLIC_BOOKING_PAGE_DETAILS.replace(
		':businessSlug',
		slug
	);
	const { data } = await apiClient.get<PikslotResponse<PublicBookingPageDetails>>(url);
	return data.data;
};

export const getBookingPageDetailsQueryOptions = (slug: string) =>
	queryOptions({
		queryKey: ['booking-page-details', slug],
		queryFn: () => getBookingPageDetails(slug)
	});
