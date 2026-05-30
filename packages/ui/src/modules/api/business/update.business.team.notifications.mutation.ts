import { BUSINESS_ENDPOINTS } from '@pikslots/shared';
import type { BaseErrorResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type {
	BusinessUpdateTeamNotificationsInput,
	BusinessUpdateTeamNotificationsResult
} from './models/business-model';
import type { PikslotResponse } from '../common/common-models';

export const updateBusinessTeamNotifications = async (
	input: BusinessUpdateTeamNotificationsInput
): Promise<BusinessUpdateTeamNotificationsResult> => {
	const { id, ...body } = input;
	const endpoint = BUSINESS_ENDPOINTS.UPDATE_TEAM_NOTIFICATIONS.replace(':id', id);
	const { data } = await apiClient.patch<PikslotResponse<BusinessUpdateTeamNotificationsResult>>(
		endpoint,
		body
	);
	return data.data;
};

export const updateBusinessTeamNotificationsMutationOptions = () =>
	mutationOptions<
		BusinessUpdateTeamNotificationsResult,
		AxiosError<BaseErrorResponse>,
		BusinessUpdateTeamNotificationsInput
	>({
		mutationKey: ['update-business-team-notifications'],
		mutationFn: updateBusinessTeamNotifications
	});
