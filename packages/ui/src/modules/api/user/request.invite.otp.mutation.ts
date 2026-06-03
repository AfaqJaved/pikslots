import { USER_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type { RequestInviteOtpInput, RequestInviteOtpResponse } from '@pikslots/shared';
import type { PikslotErrorResponse, PikslotResponse } from '../common/common-models';

export const requestInviteOtp = async (
	input: RequestInviteOtpInput
): Promise<RequestInviteOtpResponse> => {
	const { data } = await apiClient.post<PikslotResponse<RequestInviteOtpResponse>>(
		USER_ENDPOINTS.REQUEST_INVITE_OTP,
		input
	);
	return data.data;
};

export const requestInviteOtpMutationOptions = () =>
	mutationOptions<
		RequestInviteOtpResponse,
		AxiosError<PikslotErrorResponse>,
		RequestInviteOtpInput
	>({
		mutationKey: ['user-invite-request-otp'],
		mutationFn: requestInviteOtp
	});
