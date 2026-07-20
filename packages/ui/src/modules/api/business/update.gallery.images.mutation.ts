import { BUSINESS_ENDPOINTS, type UpdateBusinessGalleryPhotosResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios';
import type { PikslotErrorResponse, PikslotResponse } from '../common/common-models';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type { UpdateGalleryImagesInput } from './models/business-model';

export const updateGalleryImages = async ({
	businessId,
	galleryPhotosKeys
}: UpdateGalleryImagesInput): Promise<UpdateBusinessGalleryPhotosResponse> => {
	const url = BUSINESS_ENDPOINTS.UPDATE_GALLERY_PHOTOS.replace(':id', businessId);
	const { data } = await apiClient.patch<PikslotResponse<UpdateBusinessGalleryPhotosResponse>>(
		url,
		{
			galleryPhotosKeys
		}
	);

	return data.data;
};

export const UpdateGalleryImagesMututionOptions = () =>
	mutationOptions<
		UpdateBusinessGalleryPhotosResponse,
		AxiosError<PikslotErrorResponse>,
		UpdateGalleryImagesInput
	>({
		mutationKey: ['gallery', 'images', 'update'],
		mutationFn: updateGalleryImages
	});
