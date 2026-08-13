<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import BuildingStore from '@tabler/icons-svelte/icons/building-store';
	import Globe from '@tabler/icons-svelte/icons/globe';
	import MapPin from '@tabler/icons-svelte/icons/map-pin';
	import Clock from '@tabler/icons-svelte/icons/clock';
	import Wallet from '@tabler/icons-svelte/icons/wallet';
	import ExternalLink from '@tabler/icons-svelte/icons/external-link';
	import type { BusinessIndustry, SupportedCurrencies } from '@pikslots/shared';
	import { businessStore } from '../../../core/store/business.svelte';
	import { DAYS, fromHHmm } from '$utils/working-hours';
	import DeviceTablet from '@tabler/icons-svelte/icons/device-tablet';
	import DeviceDesktop from '@tabler/icons-svelte/icons/device-desktop';

	const business = $derived(businessStore.selectedBusiness);

	const INDUSTRIES: Record<BusinessIndustry, string> = {
		salon_and_beauty: 'Salon & Beauty',
		health_and_wellness: 'Health & Wellness',
		fitness: 'Fitness',
		medical: 'Medical',
		education: 'Education',
		legal: 'Legal',
		financial: 'Financial',
		hospitality: 'Hospitality',
		retail: 'Retail',
		other: 'Other'
	};

	const CURRENCIES: Record<SupportedCurrencies, string> = {
		USD: 'USD',
		PKR: 'PKR',
		RUB: 'RUB'
	};

	const bookingPageUrl = $derived(business ? `https://${business.slug}.pikslots.com` : '');

	const locationLine = $derived(
		business
			? [
					business.locationDetails.address,
					business.locationDetails.city,
					business.locationDetails.state,
					business.locationDetails.zip,
					business.locationDetails.country
				]
					.filter(Boolean)
					.join(', ')
			: ''
	);

	const todayIndex = $derived((new Date().getDay() + 6) % 7);
	const today = $derived(DAYS[todayIndex]);
	const todayHours = $derived(
		business?.businessHours?.[today.key] ? business.businessHours[today.key] : null
	);
</script>

<!-- Page header -->
<div class="border-b px-4 lg:px-6">
	<div class="flex items-center justify-between py-3">
		<div class="flex items-center gap-2">
			<BuildingStore size={16} class="text-muted-foreground" />
			<h1 class="text-sm font-semibold">Your brand</h1>
		</div>
		{#if business}
			<Button size="sm" href={bookingPageUrl} target="_blank" rel="noopener noreferrer">
				<ExternalLink size={14} />
				View booking page
			</Button>
		{/if}
	</div>
</div>

<!-- Content -->
<div class="grid flex-1 grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-2 lg:px-6">
	<!-- Left column: read-only brand information -->
	<div class="flex flex-col gap-6">
		<!-- Brand details -->
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-xs">Brand details</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-col gap-5">
				{#if business === null}
					<div class="flex gap-4">
						<Skeleton class="size-16 rounded-full" />
						<div class="flex flex-col gap-2">
							<Skeleton class="h-4 w-40" />
							<Skeleton class="h-3 w-24" />
						</div>
					</div>
					<Skeleton class="h-3 w-full" />
					<Skeleton class="h-3 w-2/3" />
				{:else}
					<div class="flex items-center gap-4">
						{#if business.brandDetail.brandLogoUrl}
							<img
								src={business.brandDetail.brandLogoUrl}
								alt="Brand logo"
								class="size-16 rounded-full border object-cover"
							/>
						{:else}
							<Avatar.Root class="size-16 rounded-full border">
								<Avatar.Fallback class="rounded-full bg-muted">
									<BuildingStore size={24} class="text-muted-foreground" />
								</Avatar.Fallback>
							</Avatar.Root>
						{/if}
						<div class="flex flex-col gap-0.5">
							<span class="text-base font-semibold">{business.name}</span>
							<span class="text-xs text-muted-foreground">
								{INDUSTRIES[business.industry] ?? 'Other'}
							</span>
						</div>
					</div>

					{#if business.about}
						<p class="text-xs leading-relaxed text-muted-foreground">{business.about}</p>
					{/if}

					<div class="flex flex-col gap-1.5">
						<span class="text-xs font-medium">Booking page URL</span>
						<a
							href={bookingPageUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex w-fit items-center gap-1 text-xs text-primary underline-offset-2 hover:underline"
						>
							<Globe size={14} />
							{bookingPageUrl}
						</a>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Location details -->
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-xs">Location details</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-col gap-4">
				{#if business === null}
					<Skeleton class="h-3 w-2/3" />
					<Skeleton class="h-3 w-1/2" />
					<Skeleton class="h-3 w-1/3" />
				{:else}
					{#if locationLine}
						<div class="flex items-start gap-2">
							<MapPin size={16} class="mt-0.5 shrink-0 text-muted-foreground" />
							<span class="text-xs leading-relaxed">{locationLine}</span>
						</div>
					{/if}

					<div class="flex items-center gap-2">
						<Wallet size={16} class="shrink-0 text-muted-foreground" />
						<span class="text-xs"
							>{CURRENCIES[business.locationDetails.currency] ??
								business.locationDetails.currency}</span
						>
					</div>

					<div class="flex items-center gap-2">
						<Clock size={16} class="shrink-0 text-muted-foreground" />
						<span class="text-xs">{business.locationDetails.timeZone || '—'}</span>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Business hours -->
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-xs">Business hours</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-col">
				<dl class="flex flex-col divide-y divide-border/90">
					{#if business === null}
						{#each { length: 3 } as _, i (i)}
							<div class="flex items-center justify-between py-2.5">
								<Skeleton class="h-3 w-16" />
								<Skeleton class="h-3 w-32" />
							</div>
						{/each}
					{:else}
						{#each DAYS as { key, label }, i (key)}
							{@const day = business.businessHours[key]}
							<div
								class="flex items-center justify-between py-2.5 {key === today.key
									? 'text-foreground'
									: 'text-muted-foreground'}"
							>
								<dt class="text-xs font-medium">
									{label}
									{#if key === today.key}
										<span
											class="ml-1 rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-normal text-muted-foreground"
										>
											Today
										</span>
									{/if}
								</dt>
								<dd class="text-xs">
									{#if day.enabled}
										{fromHHmm(day.openTime)} – {fromHHmm(day.closeTime)}
									{:else}
										<span class="text-muted-foreground">Day off</span>
									{/if}
								</dd>
							</div>
						{/each}
					{/if}
				</dl>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Right: Preview -->
	<div class="flex flex-col gap-3">
		<div class="flex items-center justify-between">
			<span class="text-xs font-medium">Preview</span>
			<div class="flex items-center gap-1">
				<Button variant="ghost" size="icon-sm">
					<DeviceTablet size={16} />
				</Button>
				<Button variant="ghost" size="icon-sm">
					<DeviceDesktop size={16} />
				</Button>
			</div>
		</div>

		<Card.Root class="overflow-hidden">
			<div class="border-b px-4 py-2">
				<div
					class="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-xs text-muted-foreground"
				>
					<span>https://</span>
					{#if business === null}
						<Skeleton class="h-3 w-24 rounded" />
					{:else}
						<span class="font-medium text-foreground">{bookingPageUrl || 'your-slug'}</span>
					{/if}
					<span>.pikslots.com</span>
				</div>
			</div>
			<Card.Content class="flex min-h-96 items-center justify-center bg-muted/40 p-6">
				<div class="flex flex-col items-center gap-2 text-center text-xs text-muted-foreground">
					<DeviceTablet size={32} />
					<span>Preview will appear here</span>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
