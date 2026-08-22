<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import PublicBookingPage from '../modules/public-booking/public-booking-page.svelte';

	let { data } = $props();

	$effect(() => {
		if (browser && data.isAppHost) {
			goto(resolve('/home'));
		}
	});
</script>

{#if data.businessSlug}
	<PublicBookingPage slug={data.businessSlug} />
{:else if !data.isAppHost}
	<div class="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
		No business found at this address.
	</div>
{/if}
