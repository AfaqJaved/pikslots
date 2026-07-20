import { SERVICE_ENDPOINTS } from '@pikslots/shared';
import type { UpdateServiceAvatarResult, UpdateServiceInput } from './models/service-model';
import { apiClient } from '$lib/http/axios';
import type { PikslotErrorResponse, PikslotResponse } from '../common/common-models';
import { mutationOptions } from '@tanstack/svelte-query';
import type { UpdateAvatarResult } from '../user/models/user-model';
import type { AxiosError } from 'axios';

export const updateServiceAvatar = async ({
	serviceId,
	avatarKey
}: UpdateServiceInput): Promise<UpdateServiceAvatarResult> => {
	const url = SERVICE_ENDPOINTS.UPDATE_SERVICE_AVATAR.replace(':serviceId', serviceId);
	const { data } = await apiClient.patch<PikslotResponse<UpdateServiceAvatarResult>>(url, {
		avatarKey
	});

	return data.data;
};

export const UpdateServiceAvatarMututionOptions = () =>
	mutationOptions<UpdateAvatarResult, AxiosError<PikslotErrorResponse>, UpdateServiceInput>({
		mutationKey: ['service', 'avatar', 'update'],
		mutationFn: updateServiceAvatar
	});
