<script lang="ts">
	import ServiceRow from '../../service-row.svelte';
	import type { PublicService, PublicServiceGroup } from '../../types';

	let {
		serviceGroups,
		currency,
		showPrices,
		showDuration,
		label,
		onSelect,
		unavailable = false,
		memberHasNoServices = false,
		memberName = ''
	}: {
		serviceGroups: PublicServiceGroup[];
		currency: string;
		showPrices: boolean;
		showDuration: boolean;
		label: string;
		onSelect: (service: PublicService) => void;
		unavailable?: boolean;
		memberHasNoServices?: boolean;
		memberName?: string;
	} = $props();
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-lg font-semibold">Select a {label || 'service'}</h2>

	{#if unavailable}
		<div class="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-500">
			Online Booking isn't available at the moment - please try again later.
		</div>
	{:else if memberHasNoServices}
		<div class="flex flex-col items-center justify-center gap-3 py-16 text-center">
			<h2 class="text-lg font-semibold">No Service Available</h2>
			<p class="text-sm text-muted-foreground">
				{memberName} doesn't offer any services at the moment.
			</p>
			<p class="text-xs text-muted-foreground/80">
				Please check back later or choose a different team member.
			</p>
		</div>
	{:else}
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
	{/if}
</div>
