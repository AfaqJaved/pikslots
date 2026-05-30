import { BUSINESS_ENDPOINTS } from '@pikslots/shared';
import type { BaseErrorResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type {
	BusinessUpdateAppearanceInput,
	BusinessUpdateAppearanceResult
} from './models/business-model';
import type { PikslotResponse } from '../common/common-models';

export const updateBusinessAppearance = async (
	input: BusinessUpdateAppearanceInput
): Promise<BusinessUpdateAppearanceResult> => {
	const { id, ...body } = input;
	const endpoint = BUSINESS_ENDPOINTS.UPDATE_APPEARANCE.replace(':id', id);
	const { data } = await apiClient.patch<PikslotResponse<BusinessUpdateAppearanceResult>>(
		endpoint,
		body
	);
	return data.data;
};

export const updateBusinessAppearanceMutationOptions = () =>
	mutationOptions<
		BusinessUpdateAppearanceResult,
		AxiosError<BaseErrorResponse>,
		BusinessUpdateAppearanceInput
	>({
		mutationKey: ['update-business-appearance'],
		mutationFn: updateBusinessAppearance
	});
