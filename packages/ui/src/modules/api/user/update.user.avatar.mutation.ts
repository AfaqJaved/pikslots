import { USER_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type { PikslotErrorResponse, PikslotResponse } from '../common/common-models';
import type { UpdateAvatarInput, UpdateAvatarResult } from './models/user-model';

export const updateUserAvatar = async ({
	userId,
	avatarKey
}: UpdateAvatarInput): Promise<UpdateAvatarResult> => {
	const url = USER_ENDPOINTS.UPDATE_AVATAR.replace(':userId', userId);
	const { data } = await apiClient.patch<PikslotResponse<UpdateAvatarResult>>(url, { avatarKey });
	return data.data;
};

export const updateUserAvatarMutationOptions = () =>
	mutationOptions<UpdateAvatarResult, AxiosError<PikslotErrorResponse>, UpdateAvatarInput>({
		mutationKey: ['user', 'avatar', 'update'],
		mutationFn: updateUserAvatar
	});
