<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { businessStore } from '../../core/store/business.svelte';
	import { createMutation } from '@tanstack/svelte-query';
	import { updateBusinessGeneral } from '../../api/business/update.business.general.mutation';
	import type {
		BusinessUpdateGeneralInput,
		BusinessUpdateGeneralResult
	} from '../../api/business/models/business-model';
	import type { BaseErrorResponse } from '@pikslots/shared';
	import type { AxiosError } from 'axios';
	import { toast } from 'svelte-sonner';

	const languages = [
		{ value: 'en', label: 'English' },
		{ value: 'ru', label: 'Russian' }
	];

	const business = $derived(businessStore.selectedBusiness);

	let language = $state('en');

	$effect(() => {
		if (business) {
			language = business.locationDetails.language;
		}
	});

	const isDirty = $derived(!!business && language !== business.locationDetails.language);

	const updateMutation = createMutation<
		BusinessUpdateGeneralResult,
		AxiosError<BaseErrorResponse>,
		BusinessUpdateGeneralInput
	>(() => ({
		mutationFn: updateBusinessGeneral
	}));

	$effect(() => {
		if (updateMutation.data) {
			businessStore.setSelectedBusiness(updateMutation.data);
			toast.success('General settings saved successfully.');
		}
		if (updateMutation.isError) {
			toast.error(
				updateMutation.error?.response?.data?.message ?? 'Failed to save. Please try again.'
			);
		}
	});

	function handleSave() {
		if (!business) return;
		updateMutation.mutate({ id: business.id, language });
	}
</script>

<!-- Page header -->
<div class="border-b px-4 lg:px-6">
	<div class="flex items-center justify-between py-3">
		<h1 class="text-sm font-semibold">General</h1>
		<Button
			size="sm"
			class="cursor-pointer"
			onclick={handleSave}
			disabled={!isDirty || updateMutation.isPending}
		>
			{updateMutation.isPending ? 'Saving...' : 'Save'}
		</Button>
	</div>
</div>

<!-- Content -->
<div class="flex flex-col gap-6 px-4 py-6 lg:px-6">
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
