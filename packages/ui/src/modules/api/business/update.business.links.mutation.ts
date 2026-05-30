import { BUSINESS_ENDPOINTS } from '@pikslots/shared';
import type { BaseErrorResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type { BusinessUpdateLinksInput, BusinessUpdateLinksResult } from './models/business-model';
import type { PikslotResponse } from '../common/common-models';

export const updateBusinessLinks = async (
	input: BusinessUpdateLinksInput
): Promise<BusinessUpdateLinksResult> => {
	const { id, ...links } = input;
	const endpoint = BUSINESS_ENDPOINTS.UPDATE_BUSINESS_LINKS.replace(':id', id);
	const { data } = await apiClient.patch<PikslotResponse<BusinessUpdateLinksResult>>(
		endpoint,
		links
	);
	return data.data;
};

export const updateBusinessLinksMutationOptions = () =>
	mutationOptions<
		BusinessUpdateLinksResult,
		AxiosError<BaseErrorResponse>,
		BusinessUpdateLinksInput
	>({
		mutationKey: ['update-business-links'],
		mutationFn: updateBusinessLinks
	});
