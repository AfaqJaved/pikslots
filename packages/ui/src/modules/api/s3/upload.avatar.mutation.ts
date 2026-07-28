import { S3_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type { PikslotErrorResponse, PikslotResponse } from '../common/common-models';
import type { PresignedUrlResponse } from '@pikslots/shared';
import axios from 'axios';
import { v7 as uuidv7 } from 'uuid';

export interface UploadAvatarInput {
	id: string | null;
	folder: string;
	file: File;
	type: string;
	businessSlug: string;
}

const getPresignedUploadUrl = async (
	file: File,
	id: string | null,
	folder: string,
	type: string,
	businessSlug: string
): Promise<string> => {
	const { data } = await apiClient.post<PikslotResponse<PresignedUrlResponse>>(
		S3_ENDPOINTS.PRESIGNED_UPLOAD,
		{
			filename: file.name,
			contentType: file.type,
			path: `${businessSlug}/${folder}/${id}/${type}`
		}
	);
	return data.data.url;
};

const uploadToS3 = async (url: string, file: File): Promise<void> => {
	await axios.put(url, file, {
		headers: { 'Content-Type': file.type }
	});
};

export const uploadAvatar = async ({
	id,
	folder,
	file,
	type,
	businessSlug
}: UploadAvatarInput): Promise<string> => {
	const finalId = id ?? uuidv7();
	const url = await getPresignedUploadUrl(file, finalId, folder, type, businessSlug);
	await uploadToS3(url, file);
	return `${businessSlug}/${folder}/${finalId}/${type}/${file.name}`;
};

export const uploadAvatarMutationOptions = () =>
	mutationOptions<string, AxiosError<PikslotErrorResponse>, UploadAvatarInput>({
		mutationKey: ['user', 'avatar', 'upload'],
		mutationFn: uploadAvatar
	});
