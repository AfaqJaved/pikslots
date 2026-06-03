import { USER_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type { AcceptInviteInput, AcceptInviteResponse } from '@pikslots/shared';
import type { PikslotErrorResponse, PikslotResponse } from '../common/common-models';

export const acceptInvite = async (input: AcceptInviteInput): Promise<AcceptInviteResponse> => {
	const { data } = await apiClient.post<PikslotResponse<AcceptInviteResponse>>(
		USER_ENDPOINTS.ACCEPT_INVITE,
		input
	);
	return data.data;
};

export const acceptInviteMutationOptions = () =>
	mutationOptions<AcceptInviteResponse, AxiosError<PikslotErrorResponse>, AcceptInviteInput>({
		mutationKey: ['user-invite-accept'],
		mutationFn: acceptInvite
	});
