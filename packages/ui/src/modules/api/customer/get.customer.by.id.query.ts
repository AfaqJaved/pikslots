import { CUSTOMER_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { queryOptions } from '@tanstack/svelte-query';
import type { FullCustomerModel } from './models/customer-model';
import type { PikslotResponse } from '../common/common-models';

export const getCustomerById = async (customerId: string): Promise<FullCustomerModel> => {
	const url = CUSTOMER_ENDPOINTS.FIND_BY_ID.replace(':customerId', customerId);
	const { data } = await apiClient.get<PikslotResponse<FullCustomerModel>>(url);
	return data.data;
};

export const getCustomerByIdQueryOptions = (customerId: string) =>
	queryOptions({
		queryKey: ['customer', customerId],
		queryFn: () => getCustomerById(customerId)
	});
