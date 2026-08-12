<script lang="ts">
	import ServiceRow from '../../service-row.svelte';
	import type { PublicService } from '../../types';

	let {
		services,
		currency,
		showPrices,
		showDuration,
		label,
		unavailable = false,
		onSelect
	}: {
		services: PublicService[];
		currency: string;
		showPrices: boolean;
		showDuration: boolean;
		label: string;
		unavailable?: boolean;
		onSelect: (service: PublicService) => void;
	} = $props();
</script>

<div class="flex flex-col gap-1">
	<h2 class="text-xl font-semibold">Select a {label || 'service'}</h2>
	{#if unavailable}
		<div class="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-500">
			Online Booking isn't available at the moment - please try again later.
		</div>
	{:else}
		<div class="flex flex-col gap-2 pb-2">
			{#each services as service (service.id)}
				<ServiceRow
					{service}
					{currency}
					{showPrices}
					{showDuration}
					onclick={() => onSelect(service)}
				/>
			{/each}
		</div>
	{/if}
</div>
