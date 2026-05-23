<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import BrandInstagram from '@tabler/icons-svelte/icons/brand-instagram';
	import BrandFacebook from '@tabler/icons-svelte/icons/brand-facebook';
	import BrandGoogle from '@tabler/icons-svelte/icons/brand-google';
	import Code from '@tabler/icons-svelte/icons/code';
	import Plus from '@tabler/icons-svelte/icons/plus';

	let appearInSearch = $state(true);

	const channels = [
		{ label: 'Instagram booking', icon: BrandInstagram },
		{ label: 'Facebook', icon: BrandFacebook },
		{ label: 'Reserve with Google', icon: BrandGoogle },
		{ label: 'Booking widget', icon: Code }
	];
</script>

<div class="flex flex-col">
	<!-- Page header -->
	<div class="flex items-center justify-between border-b px-6 py-4">
		<h1 class="text-base font-semibold">Booking preferences</h1>
		<Button>Save</Button>
	</div>

	<div class="flex flex-col gap-6 px-6 py-4">
		<!-- Section heading -->
		<h2 class="text-sm font-semibold">Booking Page visibility</h2>

		<!-- Search results -->
		<div class="flex flex-col gap-3">
			<div class="flex flex-col gap-0.5">
				<span class="text-xs font-medium">Search results</span>
				<span class="text-xs text-muted-foreground"
					>Make your Booking Page appear in Google and other search engines.</span
				>
			</div>
			<div class="flex items-center gap-3">
				<Switch bind:checked={appearInSearch} />
				<span class="text-xs">Appear in search results</span>
			</div>
		</div>

		<!-- Connect your booking channels -->
		<div class="flex flex-col gap-3">
			<div class="flex flex-col gap-0.5">
				<span class="text-xs font-medium">Connect your booking channels</span>
				<span class="text-xs text-muted-foreground"
					>Add your 'Book now' button to these platforms so customers can book instantly.</span
				>
			</div>
			<div class="flex flex-wrap items-center gap-2">
				{#each channels as channel (channel.label)}
					<Button variant="outline" class="gap-2 rounded-full text-xs font-normal">
						<channel.icon size={15} />
						{channel.label}
					</Button>
				{/each}
				<Button variant="outline" class="gap-1.5 rounded-full text-xs font-normal">
					<Plus size={14} />
					more
				</Button>
			</div>
		</div>
	</div>
</div>
