import type { BaseResponse, RegisterBusinessInput, RegisterBusinessResponse } from '@pikslots/shared';
import { BUSINESS_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';

export const registerBusiness = async (input: RegisterBusinessInput): Promise<RegisterBusinessResponse> => {
	const { data } = await apiClient.post<BaseResponse<RegisterBusinessResponse>>(
		BUSINESS_ENDPOINTS.REGISTER,
		input
	);
	return data.data;
};
