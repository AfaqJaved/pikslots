import { ONBOARDING_ENDPOINTS } from '@pikslots/shared';
import type {
	BaseErrorResponse,
	OnboardingCompleteInput,
	OnboardingCompleteResponse
} from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type { PikslotResponse } from '../common/common-models';

export const completeOnboarding = async (
	input: OnboardingCompleteInput
): Promise<OnboardingCompleteResponse> => {
	const { data } = await apiClient.post<PikslotResponse<OnboardingCompleteResponse>>(
		ONBOARDING_ENDPOINTS.ONBOARDING_COMPLETE,
		input
	);

	return data.data;
};

export const completeOnboardingMutationOptions = () =>
	mutationOptions<
		OnboardingCompleteResponse,
		AxiosError<BaseErrorResponse>,
		OnboardingCompleteInput
	>({
		mutationKey: ['complete-onboarding'],
		mutationFn: completeOnboarding
	});
