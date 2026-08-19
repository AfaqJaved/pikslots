import { BREAK_ENDPOINTS } from '@pikslots/shared';
import type { FindBreaksByUserResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { queryOptions } from '@tanstack/svelte-query';
import type { PikslotResponse } from '../common/common-models';

export const getBreaksByUser = async (
	userId: string,
	businessId: string
): Promise<FindBreaksByUserResponse> => {
	const url = BREAK_ENDPOINTS.FIND_ALL_BY_USER.replace(':userId', userId).replace(
		':businessId',
		businessId
	);
	const { data } = await apiClient.get<PikslotResponse<FindBreaksByUserResponse>>(url);
	return data.data;
};

export const getBreaksByUserQueryOptions = (userId: string, businessId: string) =>
	queryOptions({
		queryKey: ['breaks', 'user', userId, businessId],
		queryFn: () => getBreaksByUser(userId, businessId),
		enabled: !!userId && !!businessId
	});
