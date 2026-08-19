<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod4 as zod } from 'sveltekit-superforms/adapters';
	import { businessSchema, industries, type BusinessFormValues } from '../utils/schema';
	import { getTimezones, timezoneLabel } from '../utils/timezone';
	import { untrack } from 'svelte';
	import { FieldGroup, Field, FieldLabel, FieldError } from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Select from '$lib/components/ui/select/select.svelte';
	import SelectTrigger from '$lib/components/ui/select/select-trigger.svelte';
	import SelectContent from '$lib/components/ui/select/select-content.svelte';
	import SelectItem from '$lib/components/ui/select/select-item.svelte';
	import SelectGroup from '$lib/components/ui/select/select-group.svelte';
	import SelectGroupHeading from '$lib/components/ui/select/select-group-heading.svelte';

	let {
		values,
		onSubmit,
		onBack,
		isSubmitting = false
	}: {
		values: BusinessFormValues;
		onSubmit: () => Promise<void> | void;
		onBack: () => void;
		isSubmitting?: boolean;
	} = $props();

	const timezones = getTimezones();

	const form = superForm<BusinessFormValues>(
		untrack(() => ({ ...values })),
		{
			SPA: true,
			validators: zod(businessSchema),
			onSubmit: async ({ cancel }) => {
				const result = await form.validateForm({ update: true });
				if (!result.valid) {
					cancel();
					return;
				}
				Object.assign(values, result.data);
				await onSubmit();
			}
		}
	);

	const { form: formData, errors, enhance, submitting } = form;

	let slugEdited = $state(false);

	let timezoneOpen = $state(false);
	let tzSearch = $state('');
	let tzSearchInput = $state<HTMLInputElement | null>(null);

	const filteredTimezones = $derived.by(() => {
		const query = tzSearch.trim().toLowerCase();
		if (!query) return timezones;
		return timezones.filter(
			(tz) => tz.toLowerCase().includes(query) || timezoneLabel(tz).toLowerCase().includes(query)
		);
	});

	$effect(() => {
		if (!timezoneOpen) {
			tzSearch = '';
			return;
		}
		setTimeout(() => tzSearchInput?.focus(), 1);
	});

	function slugify(value: string): string {
		return value
			.toLowerCase()
			.trim()
			.replace(/\s+/g, '-')
			.replace(/[^a-z0-9-]/g, '')
			.replace(/-+/g, '-')
			.replace(/^-|-$/g, '');
	}

	function syncSlug() {
		if (slugEdited) return;
		const slug = slugify($formData.name);
		formData.update((data) => ({ ...data, slug }));
	}
</script>

<form method="POST" use:enhance class="flex flex-col gap-6">
	<FieldGroup>
		<Field>
			<FieldLabel for="biz_name">Business name</FieldLabel>
			<Input
				id="biz_name"
				name="name"
				bind:value={$formData.name}
				oninput={syncSlug}
				placeholder="Acme Studio"
			/>
			<FieldError errors={$errors.name?.map((e) => ({ message: e }))} />
		</Field>

		<Field>
			<FieldLabel for="slug">URL slug</FieldLabel>
			<div class="flex items-center gap-1">
				<Input
					id="slug"
					name="slug"
					disabled
					class="flex-1"
					bind:value={$formData.slug}
					oninput={() => (slugEdited = true)}
					placeholder="acme-studio"
				/>
			</div>
			<FieldError errors={$errors.slug?.map((e) => ({ message: e }))} />
		</Field>

		<Field>
			<FieldLabel for="industry">Industry</FieldLabel>
			<Select type="single" bind:value={$formData.industry}>
				<SelectTrigger id="industry">
					{#if $formData.industry}
						{industries.find((i) => i.value === $formData.industry)?.label ?? $formData.industry}
					{:else}
						<span class="text-muted-foreground">Select an industry</span>
					{/if}
				</SelectTrigger>
				<SelectContent>
					{#each industries as ind, i (i)}
						<SelectItem value={ind.value}>{ind.label}</SelectItem>
					{/each}
				</SelectContent>
			</Select>
			<FieldError errors={$errors.industry?.map((e) => ({ message: e }))} />
		</Field>

		<Field>
			<FieldLabel for="timezone">Default timezone</FieldLabel>
			<Select type="single" bind:value={$formData.default_time_zone} bind:open={timezoneOpen}>
				<SelectTrigger id="timezone">
					{#if $formData.default_time_zone}
						{timezoneLabel($formData.default_time_zone)}
					{:else}
						<span class="text-muted-foreground">Select a timezone</span>
					{/if}
				</SelectTrigger>
				<SelectContent class="max-h-60 overflow-y-auto">
					<div class="sticky top-0 z-10 border-b border-border bg-popover p-1.5">
						<Input
							bind:ref={tzSearchInput}
							type="text"
							placeholder="Search timezones..."
							bind:value={tzSearch}
							class="h-7"
							onkeydown={(e) => {
								if (e.key === 'Escape') return;
								e.stopPropagation();
								if (e.key === 'Enter') {
									e.preventDefault();
									if (filteredTimezones.length) {
										$formData.default_time_zone = filteredTimezones[0];
									}
									timezoneOpen = false;
								}
							}}
						/>
					</div>
					<SelectGroup>
						<SelectGroupHeading>All timezones</SelectGroupHeading>
						{#if filteredTimezones.length}
							{#each filteredTimezones as tz, i (i)}
								<SelectItem value={tz}>{timezoneLabel(tz)}</SelectItem>
							{/each}
						{:else}
							<div class="px-3 py-2 text-xs text-muted-foreground">No timezones found</div>
						{/if}
					</SelectGroup>
				</SelectContent>
			</Select>
			<FieldError errors={$errors.default_time_zone?.map((e) => ({ message: e }))} />
		</Field>

		<Field class="flex-row items-center justify-between">
			<div class="flex items-center justify-end gap-4">
				<Button type="button" variant="outline" onclick={onBack}>Back</Button>
				<Button type="submit">
					{$submitting || isSubmitting ? 'Saving...' : 'Create'}
				</Button>
			</div></Field
		>
	</FieldGroup>
</form>
