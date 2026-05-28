import { BUSINESS_ENDPOINTS } from '@pikslots/shared';
import type { BaseErrorResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type { BusinessCreateInput, BusinessCreateResult } from './models/business-model';
import type { PikslotResponse } from '../common/common-models';

export const registerBusiness = async (
	input: BusinessCreateInput
): Promise<BusinessCreateResult> => {
	const { data } = await apiClient.post<PikslotResponse<BusinessCreateResult>>(
		BUSINESS_ENDPOINTS.REGISTER,
		input
	);
	return data.data;
};

export const registerBusinessMutationOptions = () =>
	mutationOptions<BusinessCreateResult, AxiosError<BaseErrorResponse>, BusinessCreateInput>({
		mutationKey: ['business', 'register'],
		mutationFn: registerBusiness
	});
