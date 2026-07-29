<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Building from '@tabler/icons-svelte/icons/building';
	import MapPin from '@tabler/icons-svelte/icons/map-pin';
	import Globe from '@tabler/icons-svelte/icons/globe';
	import InfoCircle from '@tabler/icons-svelte/icons/info-circle';
	import type { PublicBusiness } from '../types';

	let {
		open = $bindable(),
		business
	}: {
		open: boolean;
		business: PublicBusiness;
	} = $props();

	const location = $derived(business.locationDetails);

	const hasLocationDetails = $derived(location.address || location.city || location.country);
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Location</Dialog.Title>
		</Dialog.Header>

		{#if hasLocationDetails}
			<div class="flex flex-col gap-4">
				{#if location.address}
					<div class="flex items-center gap-3">
						<Building size={18} class="shrink-0 text-muted-foreground" />
						<span class="text-sm">{location.address}</span>
					</div>
				{/if}

				{#if location.city}
					<div class="flex items-center gap-3">
						<MapPin size={18} class="shrink-0 text-muted-foreground" />
						<span class="text-sm">{location.city}, {location.state} {location.zip}</span>
					</div>
				{/if}

				{#if location.country}
					<div class="flex items-center gap-3">
						<Globe size={18} class="shrink-0 text-muted-foreground" />
						<span class="text-sm">{location.country}</span>
					</div>
				{/if}
			</div>
		{:else}
			<div class="flex flex-col items-center justify-center gap-3 py-8 text-muted-foreground">
				<InfoCircle size={40} class="text-muted-foreground/50" />
				<p class="text-sm">No location details available</p>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
