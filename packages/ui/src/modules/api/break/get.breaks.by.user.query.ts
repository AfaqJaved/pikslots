import { BREAK_ENDPOINTS } from '@pikslots/shared';
import type { FindBreaksByUserResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { queryOptions } from '@tanstack/svelte-query';
import type { PikslotResponse } from '../common/common-models';

export const getBreaksByUser = async (userId: string): Promise<FindBreaksByUserResponse> => {
	const url = BREAK_ENDPOINTS.FIND_ALL_BY_USER.replace(':userId', userId);
	const { data } = await apiClient.get<PikslotResponse<FindBreaksByUserResponse>>(url);
	return data.data;
};

export const getBreaksByUserQueryOptions = (userId: string) =>
	queryOptions({
		queryKey: ['breaks', 'user', userId],
		queryFn: () => getBreaksByUser(userId),
		enabled: !!userId
	});
