import { ONBOARDING_ENDPOINTS } from '@pikslots/shared';
import type { OnboardingStatusResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import type { PikslotResponse } from '../common/common-models';
import { queryOptions } from '@tanstack/svelte-query';

export const GetOnboardingStatus = async (): Promise<OnboardingStatusResponse> => {
	const { data } = await apiClient.get<PikslotResponse<OnboardingStatusResponse>>(
		ONBOARDING_ENDPOINTS.ONBOARDING_STATUS
	);
	return data.data;
};

export const GetOnboardingStatusQueryOptions = () =>
	queryOptions({
		queryKey: ['get-onboarding-status'],
		queryFn: GetOnboardingStatus
	});
