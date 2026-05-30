import { BUSINESS_ENDPOINTS } from '@pikslots/shared';
import type { BaseErrorResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type {
	BusinessUpdateBookingSetupInput,
	BusinessUpdateBookingSetupResult
} from './models/business-model';
import type { PikslotResponse } from '../common/common-models';

export const updateBusinessBookingSetup = async (
	input: BusinessUpdateBookingSetupInput
): Promise<BusinessUpdateBookingSetupResult> => {
	const { id, ...body } = input;
	const endpoint = BUSINESS_ENDPOINTS.UPDATE_BOOKING_SETUP.replace(':id', id);
	const { data } = await apiClient.patch<PikslotResponse<BusinessUpdateBookingSetupResult>>(
		endpoint,
		body
	);
	return data.data;
};

export const updateBusinessBookingSetupMutationOptions = () =>
	mutationOptions<
		BusinessUpdateBookingSetupResult,
		AxiosError<BaseErrorResponse>,
		BusinessUpdateBookingSetupInput
	>({
		mutationKey: ['update-business-booking-setup'],
		mutationFn: updateBusinessBookingSetup
	});
