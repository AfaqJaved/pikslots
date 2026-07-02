import { BREAK_ENDPOINTS } from '@pikslots/shared';
import type { BaseErrorResponse, UpdateBreakRequest, UpdateBreakResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type { PikslotResponse } from '../common/common-models';

export interface UpdateBreakInput extends UpdateBreakRequest {
	breakId: string;
}

export const updateBreak = async (input: UpdateBreakInput): Promise<UpdateBreakResponse> => {
	const url = BREAK_ENDPOINTS.UPDATE.replace(':breakId', input.breakId);
	const { breakId, ...body } = input;
	const { data } = await apiClient.patch<PikslotResponse<UpdateBreakResponse>>(url, body);
	return data.data;
};

export const updateBreakMutationOptions = () =>
	mutationOptions<UpdateBreakResponse, AxiosError<BaseErrorResponse>, UpdateBreakInput>({
		mutationKey: ['update-break'],
		mutationFn: updateBreak
	});
