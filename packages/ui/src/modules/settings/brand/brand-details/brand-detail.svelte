<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import Photo from '@tabler/icons-svelte/icons/photo';
	import Upload from '@tabler/icons-svelte/icons/upload';
	import CircleHalf from '@tabler/icons-svelte/icons/circle-half';
	import DeviceTablet from '@tabler/icons-svelte/icons/device-tablet';
	import DeviceDesktop from '@tabler/icons-svelte/icons/device-desktop';

	const industries = [
		'Automotive',
		'Beauty & Wellness',
		'Education',
		'Finance',
		'Healthcare',
		'Legal',
		'Real Estate',
		'Technology',
		'Other'
	];

	let businessName = $state('');
	let bookingUrl = $state('');
	let about = $state('');
	let selectedIndustry = $state('');
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
		<!-- Brand details section -->
		<section class="flex flex-col gap-5">
			<h2 class="text-xs font-semibold">Brand details</h2>

			<!-- Banner upload -->
			<div class="flex h-40 w-full flex-col items-center justify-center rounded-lg border bg-muted">
				<Photo size={32} class="mb-3 text-muted-foreground" />
				<Button variant="outline" size="sm">
					<Upload size={14} />
					Upload banner image
				</Button>
			</div>

			<!-- Logo upload -->
			<div class="flex items-center gap-4">
				<Avatar.Root class="size-16 rounded-full border">
					<Avatar.Fallback class="rounded-full bg-muted">
						<Photo size={20} class="text-muted-foreground" />
					</Avatar.Fallback>
				</Avatar.Root>
				<div class="flex flex-col gap-1">
					<span class="text-xs font-medium">Brand logo</span>
					<span class="text-xs text-muted-foreground"
						>Select a 200 × 200 px image, up to 10 MB in size</span
					>
					<Button variant="outline" size="sm" class="mt-1 w-fit">
						<Upload size={14} />
						Upload logo
					</Button>
				</div>
			</div>

			<!-- Business name -->
			<div class="flex flex-col gap-2">
				<Label for="business-name">Business name</Label>
				<Input id="business-name" bind:value={businessName} placeholder="Your business name" />
			</div>

			<!-- Booking page URL -->
			<div class="flex flex-col gap-2">
				<Label for="booking-url">Your Booking Page URL</Label>
				<div class="flex">
					<Input
						id="booking-url"
						bind:value={bookingUrl}
						placeholder="your-slug"
						class="rounded-r-none"
					/>
					<div
						class="flex items-center rounded-r-md border border-l-0 border-input bg-muted px-3 text-xs text-muted-foreground"
					>
						.pikslots.com
					</div>
				</div>
			</div>

			<!-- Industry -->
			<div class="flex flex-col gap-2">
				<Label>Industry</Label>
				<Select.Root type="single" bind:value={selectedIndustry}>
					<Select.Trigger class="w-full">
						{selectedIndustry || 'Select an industry'}
					</Select.Trigger>
					<Select.Content>
						{#each industries as industry}
							<Select.Item value={industry}>{industry}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<!-- About -->
			<div class="flex flex-col gap-2">
				<Label for="about">About</Label>
				<textarea
					id="about"
					bind:value={about}
					placeholder="Tell the world about your brand"
					rows={4}
					class="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
				></textarea>
			</div>
		</section>
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
					<span class="font-medium text-foreground">{bookingUrl || 'your-slug'}</span>
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
