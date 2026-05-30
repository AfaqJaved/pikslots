import { BUSINESS_ENDPOINTS } from '@pikslots/shared';
import type { BaseErrorResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type {
	BusinessUpdateBrandDetailsInput,
	BusinessUpdateBrandDetailsResult
} from './models/business-model';
import type { PikslotResponse } from '../common/common-models';

export const updateBusinessBrandDetails = async (
	input: BusinessUpdateBrandDetailsInput
): Promise<BusinessUpdateBrandDetailsResult> => {
	const { id, ...body } = input;
	const endpoint = BUSINESS_ENDPOINTS.UPDATE_BRAND_DETAILS.replace(':id', id);
	const { data } = await apiClient.patch<PikslotResponse<BusinessUpdateBrandDetailsResult>>(
		endpoint,
		body
	);
	return data.data;
};

export const updateBusinessBrandDetailsMutationOptions = () =>
	mutationOptions<
		BusinessUpdateBrandDetailsResult,
		AxiosError<BaseErrorResponse>,
		BusinessUpdateBrandDetailsInput
	>({
		mutationKey: ['update-business-brand-details'],
		mutationFn: updateBusinessBrandDetails
	});
