import {
	BUSINESS_ENDPOINTS,
	type UpdateBusinessBrandDetailsImagesResponse
} from '@pikslots/shared';
import { apiClient } from '$lib/http/axios';
import type { PikslotErrorResponse, PikslotResponse } from '../common/common-models';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type { BusinessUpdateBrandDetailsImages } from './models/business-model';

export const updatebrandDetailsImages = async ({
	businessId,
	bannerImageKey,
	brandLogoKey
}: BusinessUpdateBrandDetailsImages): Promise<UpdateBusinessBrandDetailsImagesResponse> => {
	const url = BUSINESS_ENDPOINTS.UPDATE_BRAND_DETAILS_IMAGES.replace(':id', businessId);
	const { data } = await apiClient.patch<PikslotResponse<UpdateBusinessBrandDetailsImagesResponse>>(
		url,
		{
			bannerImageKey,
			brandLogoKey
		}
	);

	return data.data;
};

export const UpdateBusinessBrandDetailsImagesMutationsOptions = () =>
	mutationOptions<
		UpdateBusinessBrandDetailsImagesResponse,
		AxiosError<PikslotErrorResponse>,
		BusinessUpdateBrandDetailsImages
	>({
		mutationKey: ['brand_details', 'images', 'update'],
		mutationFn: updatebrandDetailsImages
	});
