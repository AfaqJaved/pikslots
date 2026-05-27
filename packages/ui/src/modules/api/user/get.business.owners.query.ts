import type { BaseResponse, GetAllBusinessOwnersResponse } from '@pikslots/shared';
import { USER_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';

export const getBusinessOwners = async (): Promise<GetAllBusinessOwnersResponse> => {
	const { data } = await apiClient.get<BaseResponse<GetAllBusinessOwnersResponse>>(
		USER_ENDPOINTS.BUSINESS_OWNERS
	);
	return data.data;
};
