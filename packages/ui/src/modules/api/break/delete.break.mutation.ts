import { BREAK_ENDPOINTS } from '@pikslots/shared';
import type { BaseErrorResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';

export const deleteBreak = async (breakId: string): Promise<void> => {
	const url = BREAK_ENDPOINTS.DELETE.replace(':breakId', breakId);
	await apiClient.delete(url);
};

export const deleteBreakMutationOptions = () =>
	mutationOptions<void, AxiosError<BaseErrorResponse>, string>({
		mutationKey: ['delete-break'],
		mutationFn: deleteBreak
	});
