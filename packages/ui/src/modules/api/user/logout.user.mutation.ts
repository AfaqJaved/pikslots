import type { LogoutUserResponse, BaseResponse } from '@pikslots/shared';
import { USER_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';

export const logoutUser = async (): Promise<LogoutUserResponse> => {
	const { data } = await apiClient.post<BaseResponse<LogoutUserResponse>>(USER_ENDPOINTS.LOGOUT);
	return data.data;
};
