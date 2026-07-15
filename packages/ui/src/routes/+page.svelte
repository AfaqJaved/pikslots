<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import PublicBookingPage from '../modules/public-booking/public-booking-page.svelte';
	import { getBusinessSlugFromHost, isAppHost } from '$utils/tenant-host';

	const host = browser ? window.location.host : '';
	const slug = browser ? getBusinessSlugFromHost(host) : null;

	$effect(() => {
		if (browser && isAppHost(host)) {
			goto('/home');
		}
	});
</script>

{#if slug}
	<PublicBookingPage {slug} />
{:else if browser && !isAppHost(host)}
	<div class="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
		No business found at this address.
	</div>
{/if}
