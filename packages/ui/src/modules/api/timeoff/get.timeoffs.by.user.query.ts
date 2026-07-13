import { TIMEOFF_ENDPOINTS } from '@pikslots/shared';
import type { FindAllTimeoffByUserResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { queryOptions } from '@tanstack/svelte-query';
import type { PikslotResponse } from '../common/common-models';

export const getTimeoffsByUser = async (
	userId: string,
	businessId: string
): Promise<FindAllTimeoffByUserResponse> => {
	const url = TIMEOFF_ENDPOINTS.FINDALL.replace(':userId', userId).replace(
		':businessId',
		businessId
	);
	const { data } = await apiClient.get<PikslotResponse<FindAllTimeoffByUserResponse>>(url);
	return data.data;
};

export const getTimeoffsByUserQueryOptions = (userId: string, businessId: string) =>
	queryOptions({
		queryKey: ['timeoffs', 'user', userId, businessId],
		queryFn: () => getTimeoffsByUser(userId, businessId),
		enabled: !!userId && !!businessId
	});
