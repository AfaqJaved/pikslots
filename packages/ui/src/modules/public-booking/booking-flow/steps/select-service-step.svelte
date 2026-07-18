<script lang="ts">
	import ServiceRow from '../../service-row.svelte';
	import type { PublicService, PublicServiceGroup } from '../../types';

	let {
		serviceGroups,
		currency,
		showPrices,
		showDuration,
		onSelect
	}: {
		serviceGroups: PublicServiceGroup[];
		currency: string;
		showPrices: boolean;
		showDuration: boolean;
		onSelect: (service: PublicService) => void;
	} = $props();
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-lg font-semibold">Select a service</h2>

	<div class="flex flex-col gap-6">
		{#each serviceGroups as group (group.id)}
			<div class="flex flex-col gap-2">
				<span class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
					{group.name}
				</span>
				{#each group.services as service (service.id)}
					<ServiceRow
						{service}
						{currency}
						{showPrices}
						{showDuration}
						onclick={() => onSelect(service)}
					/>
				{/each}
			</div>
		{/each}
	</div>
</div>
