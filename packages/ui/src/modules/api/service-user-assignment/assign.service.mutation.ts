import { SERVICE_USER_ASSIGNMENT_ENDPOINTS } from '@pikslots/shared';
import type {
	AssignUserToServiceInput,
	BaseErrorResponse,
	ServiceUserAssignmentResponse
} from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type { PikslotResponse } from '../common/common-models';

export const assignService = async (
	input: AssignUserToServiceInput
): Promise<ServiceUserAssignmentResponse> => {
	const { data } = await apiClient.post<PikslotResponse<ServiceUserAssignmentResponse>>(
		SERVICE_USER_ASSIGNMENT_ENDPOINTS.ASSIGN_USER,
		input
	);
	return data.data;
};

export const assignServiceMutationOptions = () =>
	mutationOptions<
		ServiceUserAssignmentResponse,
		AxiosError<BaseErrorResponse>,
		AssignUserToServiceInput
	>({
		mutationKey: ['assign-service'],
		mutationFn: assignService
	});
