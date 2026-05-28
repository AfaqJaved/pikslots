import { USER_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type { UserInviteInput, UserInviteResult } from './models/user-model';
import type { PikslotErrorResponse, PikslotResponse } from '../common/common-models';

export const inviteUser = async (input: UserInviteInput): Promise<UserInviteResult> => {
	const { data } = await apiClient.post<PikslotResponse<UserInviteResult>>(
		USER_ENDPOINTS.INVITE,
		input
	);
	return data.data;
};

export const inviteUserMutationOptions = () =>
	mutationOptions<UserInviteResult, AxiosError<PikslotErrorResponse>, UserInviteInput>({
		mutationKey: ['user-invite'],
		mutationFn: inviteUser
	});
