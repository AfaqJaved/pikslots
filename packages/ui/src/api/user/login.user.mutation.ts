import type { LoginUserInput, LoginUserResponse, BaseResponse } from '@pikslots/shared';
import { USER_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';

export const loginUser = async (input: LoginUserInput): Promise<LoginUserResponse> => {
	const { data } = await apiClient.post<BaseResponse<LoginUserResponse>>(
		USER_ENDPOINTS.LOGIN,
		input
	);
	return data.data;
};
