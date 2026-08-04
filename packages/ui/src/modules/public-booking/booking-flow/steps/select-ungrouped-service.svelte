<script lang="ts">
	import ServiceRow from '../../service-row.svelte';
	import type { PublicService } from '../../types';

	let {
		services,
		currency,
		showPrices,
		showDuration,
		label,
		onSelect
	}: {
		services: PublicService[];
		currency: string;
		showPrices: boolean;
		showDuration: boolean;
		label: string;
		onSelect: (service: PublicService) => void;
	} = $props();
</script>

<div class="flex flex-col gap-1">
	<h2 class="text-xl font-semibold">Select a {label || 'service'}</h2>
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
</div>
