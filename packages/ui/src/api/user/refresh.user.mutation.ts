import type { BaseResponse, RefreshUserSessionResponse } from '@pikslots/shared';
import { USER_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';

export const refreshUserToken = async (): Promise<RefreshUserSessionResponse> => {
	const { data } = await apiClient.post<BaseResponse<RefreshUserSessionResponse>>(
		USER_ENDPOINTS.REFRESH
	);

	return data.data;
};
