<script lang="ts">
	import ChevronRight from '@tabler/icons-svelte/icons/chevron-right';
	import Briefcase from '@tabler/icons-svelte/icons/briefcase';
	import { formatDuration, formatCost } from './utils/format';
	import type { PublicService } from './types';

	let {
		service,
		currency,
		showPrices,
		showDuration,
		onclick
	}: {
		service: PublicService;
		currency: string;
		showPrices: boolean;
		showDuration: boolean;
		onclick: () => void;
	} = $props();
</script>

<button
	type="button"
	{onclick}
	class="flex cursor-pointer items-center gap-3 border p-3 text-left hover:bg-muted/50"
>
	<div class="flex size-11 shrink-0 items-center justify-center border bg-background">
		{#if service.images[0]}
			<img src={service.images[0]} alt={service.title} class="size-full object-cover" />
		{:else}
			<Briefcase size={18} class="text-muted-foreground" />
		{/if}
	</div>
	<div class="flex flex-col">
		<span class="text-sm font-medium">{service.title}</span>
		<span class="text-xs text-muted-foreground">
			{#if showDuration}{formatDuration(service.durationInMins)}{/if}
			{#if showDuration && showPrices}&nbsp;·&nbsp;{/if}
			{#if showPrices}{formatCost(service.cost, currency)}{/if}
		</span>
	</div>
	<ChevronRight size={16} class="ml-auto shrink-0 text-muted-foreground" />
</button>
