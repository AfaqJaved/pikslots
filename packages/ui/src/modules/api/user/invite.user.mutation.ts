import type { BaseResponse, InviteUserInput, InviteUserResponse } from '@pikslots/shared';
import { USER_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';

export const inviteUser = async (input: InviteUserInput): Promise<InviteUserResponse> => {
	const { data } = await apiClient.post<BaseResponse<InviteUserResponse>>(
		USER_ENDPOINTS.INVITE,
		input
	);
	return data.data;
};
