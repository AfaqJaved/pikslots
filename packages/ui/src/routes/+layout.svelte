<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { themeStore } from '$stores/theme.svelte.js';
	import { authStore } from '$stores/auth.svelte.js';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { Toaster } from 'svelte-sonner';
	import { refreshUserToken } from '../modules/api/user/refresh.user.mutation';
	import { browser } from '$app/environment';
	import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { i18n } from '$lib/i18n.js';
	import { localeStore } from '$stores/locale.svelte.js';

	let { children } = $props();

	const query = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser,
				staleTime: 0,
				gcTime: 0,
				refetchOnWindowFocus: false
			},
			mutations: {
				gcTime: 0
			}
		}
	});

	$effect(() => {
		themeStore.init();
		refreshUserToken()
			.then((res) => authStore.setAccessToken(res.accessToken))
			.catch(() => {})
			.finally(() => authStore.setInitialized());
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<Toaster position="top-right" title="Notification" theme={themeStore.current} richColors={true} />
<ParaglideJS {i18n} languageTag={localeStore.value}>
	<QueryClientProvider client={query}
		>{@render children()}
		<SvelteQueryDevtools />
	</QueryClientProvider>
</ParaglideJS>
