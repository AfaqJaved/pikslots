import { TIMEOFF_ENDPOINTS } from '@pikslots/shared';
import type { EditTimeoffInput, EditTimeoffResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type { PikslotErrorResponse, PikslotResponse } from '../common/common-models';

export const editTimeoff = async (input: EditTimeoffInput): Promise<EditTimeoffResponse> => {
	const url = TIMEOFF_ENDPOINTS.UPDATE.replace(':id', input.id);
	const { data } = await apiClient.patch<PikslotResponse<EditTimeoffResponse>>(url, input);
	return data.data;
};

export const editTimeoffMutationOptions = () =>
	mutationOptions<EditTimeoffResponse, AxiosError<PikslotErrorResponse>, EditTimeoffInput>({
		mutationKey: ['edit-timeoff'],
		mutationFn: editTimeoff
	});
