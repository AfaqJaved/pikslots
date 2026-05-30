import { BUSINESS_ENDPOINTS } from '@pikslots/shared';
import type { BaseErrorResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type {
	BusinessUpdateGeneralInput,
	BusinessUpdateGeneralResult
} from './models/business-model';
import type { PikslotResponse } from '../common/common-models';

export const updateBusinessGeneral = async (
	input: BusinessUpdateGeneralInput
): Promise<BusinessUpdateGeneralResult> => {
	const { id, ...body } = input;
	const endpoint = BUSINESS_ENDPOINTS.UPDATE_GENERAL.replace(':id', id);
	const { data } = await apiClient.patch<PikslotResponse<BusinessUpdateGeneralResult>>(
		endpoint,
		body
	);
	return data.data;
};

export const updateBusinessGeneralMutationOptions = () =>
	mutationOptions<
		BusinessUpdateGeneralResult,
		AxiosError<BaseErrorResponse>,
		BusinessUpdateGeneralInput
	>({
		mutationKey: ['update-business-general'],
		mutationFn: updateBusinessGeneral
	});
