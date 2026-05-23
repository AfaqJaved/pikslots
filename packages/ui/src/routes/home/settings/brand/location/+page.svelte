<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import CircleHalf from '@tabler/icons-svelte/icons/circle-half';
	import DeviceTablet from '@tabler/icons-svelte/icons/device-tablet';
	import DeviceDesktop from '@tabler/icons-svelte/icons/device-desktop';

	const countries = [
		'Afghanistan', 'Australia', 'Canada', 'China', 'France',
		'Germany', 'India', 'Pakistan', 'United Kingdom', 'United States'
	];

	const currencies = [
		{ value: 'PKR', label: 'Pakistan - PKR Rs' },
		{ value: 'USD', label: 'United States - USD $' },
		{ value: 'GBP', label: 'United Kingdom - GBP £' },
		{ value: 'EUR', label: 'Europe - EUR €' },
		{ value: 'INR', label: 'India - INR ₹' },
		{ value: 'AUD', label: 'Australia - AUD $' }
	];

	let address = $state('');
	let city = $state('');
	let state = $state('');
	let zip = $state('');
	let country = $state('Pakistan');
	let currency = $state('PKR');
	let previewDevice = $state<'tablet' | 'desktop'>('tablet');
</script>

<!-- Page header -->
<div class="border-b px-4 lg:px-6">
	<div class="flex items-center justify-between py-3">
		<div class="flex items-center gap-3">
			<h1 class="text-sm font-semibold">Your brand</h1>
			<div class="flex items-center gap-1.5 text-xs text-muted-foreground">
				<CircleHalf size={14} />
				<span>35% complete</span>
			</div>
		</div>
		<Button size="sm">Save</Button>
	</div>
</div>

<!-- Two column layout -->
<div class="grid flex-1 grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-2 lg:px-6">
	<!-- Left: Form -->
	<div class="flex flex-col gap-8">
		<section class="flex flex-col gap-5">
			<div class="flex flex-col gap-1">
				<h2 class="text-xs font-semibold">Location</h2>
				<p class="text-xs text-muted-foreground">Provide a business address to list on your Booking Page.</p>
			</div>

			<!-- Address -->
			<div class="flex flex-col gap-2">
				<Label for="address">Address</Label>
				<Input
					id="address"
					bind:value={address}
					placeholder="Business name, street name, apt, suite, floor"
				/>
			</div>

			<!-- City -->
			<div class="flex flex-col gap-2">
				<Label for="city">City</Label>
				<Input id="city" bind:value={city} placeholder="San Francisco" />
			</div>

			<!-- State + Zip -->
			<div class="grid grid-cols-2 gap-3">
				<div class="flex flex-col gap-2">
					<Label>State</Label>
					<Select.Root type="single" bind:value={state}>
						<Select.Trigger class="w-full">
							{state || 'Select'}
						</Select.Trigger>
						<Select.Content>
							{#each ['California', 'New York', 'Texas', 'Punjab', 'Sindh', 'KPK'] as s (s)}
								<Select.Item value={s}>{s}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="flex flex-col gap-2">
					<Label for="zip">Zip or postal code</Label>
					<Input id="zip" bind:value={zip} placeholder="000000" />
				</div>
			</div>

			<!-- Country -->
			<div class="flex flex-col gap-2">
				<Label>Country</Label>
				<Select.Root type="single" bind:value={country}>
					<Select.Trigger class="w-full">
						{country || 'Select a country'}
					</Select.Trigger>
					<Select.Content>
						{#each countries as c (c)}
							<Select.Item value={c}>{c}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<!-- Currency -->
			<div class="flex flex-col gap-2">
				<Label>Currency</Label>
				<Select.Root type="single" bind:value={currency}>
					<Select.Trigger class="w-full">
						{currencies.find((c) => c.value === currency)?.label ?? 'Select a currency'}
					</Select.Trigger>
					<Select.Content>
						{#each currencies as c (c.value)}
							<Select.Item value={c.value}>{c.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</section>
	</div>

	<!-- Right: Preview -->
	<div class="flex flex-col gap-3">
		<div class="flex items-center justify-between">
			<span class="text-xs font-medium">Preview</span>
			<div class="flex items-center gap-1">
				<Button
					variant={previewDevice === 'tablet' ? 'secondary' : 'ghost'}
					size="icon-sm"
					onclick={() => (previewDevice = 'tablet')}
				>
					<DeviceTablet size={16} />
				</Button>
				<Button
					variant={previewDevice === 'desktop' ? 'secondary' : 'ghost'}
					size="icon-sm"
					onclick={() => (previewDevice = 'desktop')}
				>
					<DeviceDesktop size={16} />
				</Button>
			</div>
		</div>

		<Card.Root class="overflow-hidden">
			<div class="border-b px-4 py-2">
				<div class="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-xs text-muted-foreground">
					<span>https://</span>
					<span class="font-medium text-foreground">your-slug</span>
					<span>.pikslots.com</span>
				</div>
			</div>
			<Card.Content class="flex min-h-96 items-center justify-center bg-muted/40 p-6">
				<div class="flex flex-col items-center gap-2 text-center text-xs text-muted-foreground">
					{#if previewDevice === 'tablet'}
						<DeviceTablet size={32} />
					{:else}
						<DeviceDesktop size={32} />
					{/if}
					<span>Preview will appear here</span>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
