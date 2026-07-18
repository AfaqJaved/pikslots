import { SERVICE_USER_ASSIGNMENT_ENDPOINTS } from '@pikslots/shared';
import type { BaseErrorResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';

export interface RemoveServiceInput {
	serviceId: string;
	userId: string;
}

export const removeService = async (input: RemoveServiceInput): Promise<void> => {
	const url = SERVICE_USER_ASSIGNMENT_ENDPOINTS.REMOVE_USER.replace(
		':serviceId',
		input.serviceId
	).replace(':userId', input.userId);
	await apiClient.delete(url);
};

export const removeServiceMutationOptions = () =>
	mutationOptions<void, AxiosError<BaseErrorResponse>, RemoveServiceInput>({
		mutationKey: ['remove-service'],
		mutationFn: removeService
	});
