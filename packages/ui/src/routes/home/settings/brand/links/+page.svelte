<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import CircleHalf from '@tabler/icons-svelte/icons/circle-half';
	import DeviceTablet from '@tabler/icons-svelte/icons/device-tablet';
	import DeviceDesktop from '@tabler/icons-svelte/icons/device-desktop';
	import Plus from '@tabler/icons-svelte/icons/plus';

	let website = $state('');
	let instagram = $state('');
	let facebook = $state('');
	let previewDevice = $state<'tablet' | 'desktop'>('tablet');
</script>

<!-- Page header -->
<div class="border-b px-4 lg:px-6">
	<div class="flex items-center justify-between py-3">
		<div class="flex items-center gap-3">
			<h1 class="text-base font-semibold">Your brand</h1>
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
				<h2 class="text-sm font-semibold">Your links</h2>
				<p class="text-sm text-muted-foreground">Drive Booking Page visitors to your site, socials and more.</p>
			</div>

			<div class="flex flex-col gap-2">
				<Label for="website">Website</Label>
				<Input id="website" type="url" bind:value={website} placeholder="" />
			</div>

			<div class="flex flex-col gap-2">
				<Label for="instagram">Instagram</Label>
				<Input id="instagram" type="url" bind:value={instagram} placeholder="" />
			</div>

			<div class="flex flex-col gap-2">
				<Label for="facebook">Facebook</Label>
				<Input id="facebook" type="url" bind:value={facebook} placeholder="" />
			</div>

			<Button variant="ghost" size="sm" class="w-fit gap-1.5 px-0 text-muted-foreground hover:text-foreground">
				<Plus size={14} />
				Add more
			</Button>
		</section>
	</div>

	<!-- Right: Preview -->
	<div class="flex flex-col gap-3">
		<div class="flex items-center justify-between">
			<span class="text-sm font-medium">Preview</span>
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
