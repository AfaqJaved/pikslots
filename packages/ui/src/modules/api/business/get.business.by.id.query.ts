import { BUSINESS_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { queryOptions } from '@tanstack/svelte-query';
import type { BusinessModel } from './models/business-model';
import type { PikslotResponse } from '../common/common-models';

export const getBusinessById = async (businessId?: string): Promise<BusinessModel | null> => {
	if (!businessId) return null;
	const url = BUSINESS_ENDPOINTS.GET_BY_ID.replace(':id', businessId);
	const { data } = await apiClient.get<PikslotResponse<BusinessModel>>(url);
	return data.data;
};

export const getBusinessByIdQueryOptions = (enabled: boolean, businessId?: string) =>
	queryOptions({
		queryKey: ['business', businessId],
		queryFn: () => getBusinessById(businessId),
		enabled,
		staleTime: 0,
		gcTime: 0
	});
