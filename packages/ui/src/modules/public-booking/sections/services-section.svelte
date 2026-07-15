<script lang="ts">
	import { untrack } from 'svelte';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import ChevronDown from '@tabler/icons-svelte/icons/chevron-down';
	import ServiceRow from '../service-row.svelte';
	import type { PublicService, PublicServiceGroup } from '../types';

	let {
		serviceGroups,
		currency,
		showPrices,
		showDuration,
		onSelectService
	}: {
		serviceGroups: PublicServiceGroup[];
		currency: string;
		showPrices: boolean;
		showDuration: boolean;
		onSelectService: (service: PublicService) => void;
	} = $props();

	// Intentionally captures only the initial groups — all expanded by default,
	// independent of later prop changes so user-toggled state isn't reset.
	let openGroups = $state<string[]>(untrack(() => serviceGroups.map((g) => g.id)));
</script>

<div class="flex flex-col gap-1">
	<h2 class="text-xl font-semibold">Services</h2>

	<Accordion.Root type="multiple" bind:value={openGroups}>
		{#each serviceGroups as group (group.id)}
			<Accordion.Item value={group.id} class="border-b-0">
				<div class="flex items-center justify-between py-3">
					<span class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
						{group.name}
					</span>
					<button
						type="button"
						class="cursor-pointer text-muted-foreground hover:text-foreground"
						onclick={() =>
							(openGroups = openGroups.includes(group.id)
								? openGroups.filter((id) => id !== group.id)
								: [...openGroups, group.id])}
					>
						<ChevronDown
							size={16}
							class="transition-transform {openGroups.includes(group.id) ? 'rotate-180' : ''}"
						/>
					</button>
				</div>

				<Accordion.Content class="p-0">
					<div class="flex flex-col gap-2 pb-2">
						{#each group.services as service (service.id)}
							<ServiceRow
								{service}
								{currency}
								{showPrices}
								{showDuration}
								onclick={() => onSelectService(service)}
							/>
						{/each}
					</div>
				</Accordion.Content>
			</Accordion.Item>
		{/each}
	</Accordion.Root>
</div>
