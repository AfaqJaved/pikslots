<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';

	const languages = [
		{ value: 'en-US', label: 'English (US)' },
		{ value: 'en-GB', label: 'English (UK)' },
		{ value: 'fr', label: 'French' },
		{ value: 'de', label: 'German' },
		{ value: 'es', label: 'Spanish' },
		{ value: 'ar', label: 'Arabic' },
		{ value: 'ur', label: 'Urdu' }
	];

	let language = $state('en-US');
</script>

<div class="flex flex-col gap-6 px-6 py-6">
	<h1 class="text-base font-semibold">General</h1>

	<div class="flex w-56 flex-col gap-2">
		<Select.Root type="single" bind:value={language}>
			<Select.Trigger class="w-full">
				<div class="flex flex-col items-start gap-0.5 text-left">
					<!-- <span class="text-xs text-muted-foreground">Preferred language</span> -->
					<span class="text-sm font-medium">
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
		<p class="text-xs text-muted-foreground">
			This will be your default language in the Pikslots web application.
		</p>
	</div>
</div>
