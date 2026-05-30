import { BUSINESS_ENDPOINTS } from '@pikslots/shared';
import type { BaseErrorResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type {
	BusinessUpdateVisibilityInput,
	BusinessUpdateVisibilityResult
} from './models/business-model';
import type { PikslotResponse } from '../common/common-models';

export const updateBusinessVisibility = async (
	input: BusinessUpdateVisibilityInput
): Promise<BusinessUpdateVisibilityResult> => {
	const { id, ...body } = input;
	const endpoint = BUSINESS_ENDPOINTS.UPDATE_VISIBILITY.replace(':id', id);
	const { data } = await apiClient.patch<PikslotResponse<BusinessUpdateVisibilityResult>>(
		endpoint,
		body
	);
	return data.data;
};

export const updateBusinessVisibilityMutationOptions = () =>
	mutationOptions<
		BusinessUpdateVisibilityResult,
		AxiosError<BaseErrorResponse>,
		BusinessUpdateVisibilityInput
	>({
		mutationKey: ['update-business-visibility'],
		mutationFn: updateBusinessVisibility
	});
