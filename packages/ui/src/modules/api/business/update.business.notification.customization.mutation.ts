import { BUSINESS_ENDPOINTS } from '@pikslots/shared';
import type { BaseErrorResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type {
	BusinessUpdateNotificationCustomizationInput,
	BusinessUpdateNotificationCustomizationResult
} from './models/business-model';
import type { PikslotResponse } from '../common/common-models';

export const updateBusinessNotificationCustomization = async (
	input: BusinessUpdateNotificationCustomizationInput
): Promise<BusinessUpdateNotificationCustomizationResult> => {
	const { id, ...body } = input;
	const endpoint = BUSINESS_ENDPOINTS.UPDATE_NOTIFICATION_CUSTOMIZATION.replace(':id', id);
	const { data } = await apiClient.patch<
		PikslotResponse<BusinessUpdateNotificationCustomizationResult>
	>(endpoint, body);
	return data.data;
};

export const updateBusinessNotificationCustomizationMutationOptions = () =>
	mutationOptions<
		BusinessUpdateNotificationCustomizationResult,
		AxiosError<BaseErrorResponse>,
		BusinessUpdateNotificationCustomizationInput
	>({
		mutationKey: ['update-business-notification-customization'],
		mutationFn: updateBusinessNotificationCustomization
	});
