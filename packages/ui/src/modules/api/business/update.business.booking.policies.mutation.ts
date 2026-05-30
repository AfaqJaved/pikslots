import { BUSINESS_ENDPOINTS } from '@pikslots/shared';
import type { BaseErrorResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type {
	BusinessUpdateBookingPoliciesInput,
	BusinessUpdateBookingPoliciesResult
} from './models/business-model';
import type { PikslotResponse } from '../common/common-models';

export const updateBusinessBookingPolicies = async (
	input: BusinessUpdateBookingPoliciesInput
): Promise<BusinessUpdateBookingPoliciesResult> => {
	const { id, ...body } = input;
	const endpoint = BUSINESS_ENDPOINTS.UPDATE_BOOKING_POLICIES.replace(':id', id);
	const { data } = await apiClient.patch<PikslotResponse<BusinessUpdateBookingPoliciesResult>>(
		endpoint,
		body
	);
	return data.data;
};

export const updateBusinessBookingPoliciesMutationOptions = () =>
	mutationOptions<
		BusinessUpdateBookingPoliciesResult,
		AxiosError<BaseErrorResponse>,
		BusinessUpdateBookingPoliciesInput
	>({
		mutationKey: ['update-business-booking-policies'],
		mutationFn: updateBusinessBookingPolicies
	});
