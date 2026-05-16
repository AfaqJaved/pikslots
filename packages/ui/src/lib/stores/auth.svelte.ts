function createAuthStore() {
	let accessToken = $state<string | null>(null);

	function setAccessToken(token: string) {
		accessToken = token;
	}

	function clearAccessToken() {
		accessToken = null;
	}

	return {
		get accessToken() {
			return accessToken;
		},
		get isAuthenticated() {
			return accessToken !== null;
		},
		setAccessToken,
		clearAccessToken
	};
}

export const authStore = createAuthStore();
