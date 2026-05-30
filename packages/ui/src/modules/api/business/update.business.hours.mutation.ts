import { BUSINESS_ENDPOINTS } from '@pikslots/shared';
import type { BaseErrorResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type { BusinessUpdateHoursInput, BusinessUpdateHoursResult } from './models/business-model';
import type { PikslotResponse } from '../common/common-models';

export const updateBusinessHours = async (
	input: BusinessUpdateHoursInput
): Promise<BusinessUpdateHoursResult> => {
	const endpoint = BUSINESS_ENDPOINTS.UPDATE_BUSINESS_HOURS.replace(':id', input.id);
	const { data } = await apiClient.patch<PikslotResponse<BusinessUpdateHoursResult>>(
		endpoint,
		input.businessHours
	);
	return data.data;
};

export const updateBusinessHoursMutationOptions = () =>
	mutationOptions<
		BusinessUpdateHoursResult,
		AxiosError<BaseErrorResponse>,
		BusinessUpdateHoursInput
	>({
		mutationKey: ['update-business-hours'],
		mutationFn: updateBusinessHours
	});
