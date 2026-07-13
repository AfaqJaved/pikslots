import { TIMEOFF_ENDPOINTS } from '@pikslots/shared';
import type { RegisterTimeoffInput, RegisterTimeoffResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type { PikslotErrorResponse, PikslotResponse } from '../common/common-models';

export const registerTimeoff = async (
	input: RegisterTimeoffInput
): Promise<RegisterTimeoffResponse> => {
	const { data } = await apiClient.post<PikslotResponse<RegisterTimeoffResponse>>(
		TIMEOFF_ENDPOINTS.REGISTER,
		input
	);
	return data.data;
};

export const registerTimeoffMutationOptions = () =>
	mutationOptions<RegisterTimeoffResponse, AxiosError<PikslotErrorResponse>, RegisterTimeoffInput>({
		mutationKey: ['register-timeoff'],
		mutationFn: registerTimeoff
	});
