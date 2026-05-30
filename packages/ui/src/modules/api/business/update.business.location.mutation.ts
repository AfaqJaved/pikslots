import { BUSINESS_ENDPOINTS } from '@pikslots/shared';
import type { BaseErrorResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type {
	BusinessUpdateLocationInput,
	BusinessUpdateLocationResult
} from './models/business-model';
import type { PikslotResponse } from '../common/common-models';

export const updateBusinessLocation = async (
	input: BusinessUpdateLocationInput
): Promise<BusinessUpdateLocationResult> => {
	const { id, ...body } = input;
	const endpoint = BUSINESS_ENDPOINTS.UPDATE_LOCATION.replace(':id', id);
	const { data } = await apiClient.patch<PikslotResponse<BusinessUpdateLocationResult>>(
		endpoint,
		body
	);
	return data.data;
};

export const updateBusinessLocationMutationOptions = () =>
	mutationOptions<
		BusinessUpdateLocationResult,
		AxiosError<BaseErrorResponse>,
		BusinessUpdateLocationInput
	>({
		mutationKey: ['update-business-location'],
		mutationFn: updateBusinessLocation
	});
