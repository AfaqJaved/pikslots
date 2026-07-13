import { TIMEOFF_ENDPOINTS } from '@pikslots/shared';
import type { BaseErrorResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';

export const deleteTimeoff = async (id: string): Promise<void> => {
	const url = TIMEOFF_ENDPOINTS.DELETE.replace(':id', id);
	await apiClient.delete(url);
};

export const deleteTimeoffMutationOptions = () =>
	mutationOptions<void, AxiosError<BaseErrorResponse>, string>({
		mutationKey: ['delete-timeoff'],
		mutationFn: deleteTimeoff
	});
