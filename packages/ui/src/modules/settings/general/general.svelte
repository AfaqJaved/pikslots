<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { businessStore } from '../../core/store/business.svelte';

	const languages = [
		{ value: 'en', label: 'English' },
		{ value: 'fr', label: 'French' },
		{ value: 'de', label: 'German' },
		{ value: 'es', label: 'Spanish' },
		{ value: 'ar', label: 'Arabic' },
		{ value: 'ur', label: 'Urdu' }
	];

	const business = $derived(businessStore.selectedBusiness);

	let language = $state('en-US');

	$effect(() => {
		if (business) {
			language = business.locationDetails.language;
		}
	});
</script>

<div class="flex flex-col gap-6 px-6 py-6">
	<h1 class="text-sm font-semibold">General</h1>

	<div class="flex w-56 flex-col gap-2">
		{#if business === null}
			<Skeleton class="h-9 w-full rounded-md" />
		{:else}
			<Select.Root type="single" bind:value={language}>
				<Select.Trigger class="w-full">
					<div class="flex flex-col items-start gap-0.5 text-left">
						<span class="text-xs font-medium">
							{languages.find((l) => l.value === language)?.label ?? 'Select a language'}
						</span>
					</div>
				</Select.Trigger>
				<Select.Content>
					{#each languages as l (l.value)}
						<Select.Item value={l.value}>{l.label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		{/if}
		<p class="text-xs text-muted-foreground">
			This will be your default language in the Pikslots web application.
		</p>
	</div>
</div>
