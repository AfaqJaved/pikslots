import axios from 'axios';
import { authStore } from '$stores/auth.svelte.js';
import { USER_ENDPOINTS } from '@pikslots/shared';

export const apiClient = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	withCredentials: true
});

apiClient.interceptors.request.use((config) => {
	if (authStore.accessToken) {
		config.headers.Authorization = `Bearer ${authStore.accessToken}`;
	}
	return config;
});

apiClient.interceptors.response.use(
	(response) => response,
	async (error) => {
		const original = error.config;
		const is401 = error.response?.status === 401;
		const isRefreshEndpoint = original.url === USER_ENDPOINTS.REFRESH;
		const isLoginEndpoint = original.url === USER_ENDPOINTS.LOGIN;

		if (is401 && !original._retry && !isRefreshEndpoint && !isLoginEndpoint) {
			original._retry = true;
			const { data } = await apiClient.post(USER_ENDPOINTS.REFRESH);
			authStore.setAccessToken(data.data.accessToken);
			original.headers.Authorization = `Bearer ${data.data.accessToken}`;
			return apiClient(original);
		}

		return Promise.reject(error);
	}
);
