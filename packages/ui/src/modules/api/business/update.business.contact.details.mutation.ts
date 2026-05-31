import { BUSINESS_ENDPOINTS } from '@pikslots/shared';
import type { BaseErrorResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type {
	BusinessUpdateContactDetailsInput,
	BusinessUpdateContactDetailsResult
} from './models/business-model';
import type { PikslotResponse } from '../common/common-models';

export const updateBusinessContactDetails = async (
	input: BusinessUpdateContactDetailsInput
): Promise<BusinessUpdateContactDetailsResult> => {
	const { id, ...contactDetails } = input;
	const endpoint = BUSINESS_ENDPOINTS.UPDATE_CONTACT_DETAILS.replace(':id', id);
	const { data } = await apiClient.patch<PikslotResponse<BusinessUpdateContactDetailsResult>>(
		endpoint,
		contactDetails
	);
	return data.data;
};

export const updateBusinessContactDetailsMutationOptions = () =>
	mutationOptions<
		BusinessUpdateContactDetailsResult,
		AxiosError<BaseErrorResponse>,
		BusinessUpdateContactDetailsInput
	>({
		mutationKey: ['update-business-contact-details'],
		mutationFn: updateBusinessContactDetails
	});
