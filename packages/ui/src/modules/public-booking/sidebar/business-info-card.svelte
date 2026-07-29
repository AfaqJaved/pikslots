<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import Clock from '@tabler/icons-svelte/icons/clock';
	import ChevronDown from '@tabler/icons-svelte/icons/chevron-down';
	import Headset from '@tabler/icons-svelte/icons/headset';
	import Chrome from '@tabler/icons-svelte/icons/brand-chrome';
	import Instagram from '@tabler/icons-svelte/icons/brand-instagram';
	import Facebook from '@tabler/icons-svelte/icons/brand-facebook';
	import HoursList from './hours-list.svelte';
	import { getBusinessHoursStatus } from '../utils/business-hours-status';
	import ContactUsDialog from '../dialogs/contact-us-dialog.svelte';
	import LocationDialog from '../dialogs/location-dialog.svelte';
	import type { PublicBusiness } from '../types';
	import Location from '@tabler/icons-svelte/icons/location';

	let { business, onBook }: { business: PublicBusiness; onBook: () => void } = $props();

	let hoursExpanded = $state(true);
	let contactDialogOpen = $state(false);
	let LocationDialogOpen = $state(false);

	const status = $derived(
		getBusinessHoursStatus(business.businessHours, business.locationDetails.timeZone)
	);
</script>

<div class="flex flex-col border p-6">
	<h2 class="text-center text-xl font-semibold">{business.name}</h2>

	<Button
		class={`mt-4 w-full  ${
			business.brandApperanceDetails.brandButtonShape.trim() === 'pill'
				? 'rounded-full'
				: business.brandApperanceDetails.brandButtonShape.trim() === 'rounded'
					? 'rounded-xl'
					: 'rounded-none'
		}`}
		style="background-color: {business.brandApperanceDetails.brandColor}"
		onclick={onBook}>Book</Button
	>

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
	<div class="flex flex-col gap-2 p-2 text-white">
		<Button
			class={`flex w-full items-center gap-2  ${
				business.brandApperanceDetails.brandButtonShape.trim() === 'pill'
					? 'rounded-full'
					: business.brandApperanceDetails.brandButtonShape.trim() === 'rounded'
						? 'rounded-xl'
						: 'rounded-none'
			}`}
			style="background-color: {business.brandApperanceDetails.brandColor}"
			onclick={() => (contactDialogOpen = true)}
		>
			<Headset size={16} />
			Contact Us
		</Button>

		<Button
			class={`flex w-full items-center gap-2  ${
				business.brandApperanceDetails.brandButtonShape.trim() === 'pill'
					? 'rounded-full'
					: business.brandApperanceDetails.brandButtonShape.trim() === 'rounded'
						? 'rounded-xl'
						: 'rounded-none'
			}`}
			style="background-color: {business.brandApperanceDetails.brandColor}"
			onclick={() => (LocationDialogOpen = true)}
		>
			<Location size={16} />
			Location
		</Button>
	</div>
	<div class="flex w-full items-center justify-center">
		{#if business.businessLinks.Website}
			<a href={business.businessLinks.Website} target="_blank" rel="noopener noreferrer">
				<Button class="bg-transparent">
					<Chrome size={24} />
				</Button>
			</a>
		{/if}

		{#if business.businessLinks.Instagram}
			<a href={business.businessLinks.Instagram} target="_blank" rel="noopener noreferrer">
				<Button class="bg-transparent">
					<Instagram size={24} class="text-white" />
				</Button>
			</a>
		{/if}

		{#if business.businessLinks.Facebook}
			<a
				class="bg-transparent"
				href={business.businessLinks.Facebook}
				target="_blank"
				rel="noopener noreferrer"
			>
				<Button class="bg-transparent">
					<Facebook size={24} />
				</Button>
			</a>
		{/if}
	</div>
</div>

<ContactUsDialog bind:open={contactDialogOpen} {business} />
<LocationDialog bind:open={LocationDialogOpen} {business} />
