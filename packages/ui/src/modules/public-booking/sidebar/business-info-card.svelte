<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import Clock from '@tabler/icons-svelte/icons/clock';
	import ChevronDown from '@tabler/icons-svelte/icons/chevron-down';
	import HoursList from './hours-list.svelte';
	import { getBusinessHoursStatus } from '../utils/business-hours-status';
	import type { PublicBusiness } from '../types';

	let { business, onBook }: { business: PublicBusiness; onBook: () => void } = $props();

	let hoursExpanded = $state(true);

	const status = $derived(
		getBusinessHoursStatus(business.businessHours, business.locationDetails.timeZone)
	);
</script>

<div class="flex flex-col border p-6">
	<h2 class="text-center text-xl font-semibold">{business.name}</h2>

	<Button class="mt-4 w-full" onclick={onBook}>Book</Button>

	{#if business.bookingCustomization.showBusinessHours}
		<button
			type="button"
			class="mt-6 flex cursor-pointer items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
			onclick={() => (hoursExpanded = !hoursExpanded)}
		>
			<Clock size={15} />
			<span>{status.label}</span>
			<ChevronDown size={15} class="transition-transform {hoursExpanded ? 'rotate-180' : ''}" />
		</button>

		{#if hoursExpanded}
			<div class="mt-4">
				<HoursList
					businessHours={business.businessHours}
					timeZone={business.locationDetails.timeZone}
				/>
			</div>
		{/if}
	{/if}
</div>
