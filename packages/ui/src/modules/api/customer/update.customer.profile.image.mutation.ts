import { CUSTOMER_ENDPOINTS } from '@pikslots/shared';
import type { BaseErrorResponse, EditCustomerResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type { PikslotResponse } from '../common/common-models';
import type { UpdateCustomerProfileImageResponse } from '@pikslots/shared';
import type { customerProfileImageInput } from './models/customer-model';

export const updateCustomerProfileImage = async (
	input: customerProfileImageInput
): Promise<UpdateCustomerProfileImageResponse> => {
	const url = CUSTOMER_ENDPOINTS.UPDATE_PROFILE_IMAGE.replace(':customerId', input.customerId);
	const { data } = await apiClient.patch<PikslotResponse<EditCustomerResponse>>(url, input);
	return data.data;
};

export const UpdateCustomerProfileImageMutationOptions = () =>
	mutationOptions<EditCustomerResponse, AxiosError<BaseErrorResponse>, customerProfileImageInput>({
		mutationKey: ['update-customer-profile-image'],
		mutationFn: updateCustomerProfileImage
	});
