import { BREAK_ENDPOINTS } from '@pikslots/shared';
import type { BaseErrorResponse, CreateBreakRequest, CreateBreakResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type { PikslotResponse } from '../common/common-models';

export const createBreak = async (input: CreateBreakRequest): Promise<CreateBreakResponse> => {
	const { data } = await apiClient.post<PikslotResponse<CreateBreakResponse>>(
		BREAK_ENDPOINTS.CREATE,
		input
	);
	return data.data;
};

export const createBreakMutationOptions = () =>
	mutationOptions<CreateBreakResponse, AxiosError<BaseErrorResponse>, CreateBreakRequest>({
		mutationKey: ['create-break'],
		mutationFn: createBreak
	});
