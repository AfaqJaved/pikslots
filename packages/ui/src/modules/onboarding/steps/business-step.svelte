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

	const isValid = $derived(businessSchema.safeParse($formData).success);

	let slugEdited = $state(false);

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
			<Select type="single" bind:value={$formData.default_time_zone}>
				<SelectTrigger id="timezone">
					{#if $formData.default_time_zone}
						{timezoneLabel($formData.default_time_zone)}
					{:else}
						<span class="text-muted-foreground">Select a timezone</span>
					{/if}
				</SelectTrigger>
				<SelectContent class="max-h-60 overflow-y-auto">
					<SelectGroup>
						<SelectGroupHeading>All timezones</SelectGroupHeading>
						{#each timezones as tz, i (i)}
							<SelectItem value={tz}>{timezoneLabel(tz)}</SelectItem>
						{/each}
					</SelectGroup>
				</SelectContent>
			</Select>
			<FieldError errors={$errors.default_time_zone?.map((e) => ({ message: e }))} />
		</Field>

		<Field class="flex-row items-center justify-between">
			<div class="flex items-center justify-end gap-4">
				<Button type="button" variant="outline" onclick={onBack}>Back</Button>
				<Button type="submit" disabled={!isValid}>
					{$submitting || isSubmitting ? 'Saving...' : 'Create'}
				</Button>
			</div></Field
		>
	</FieldGroup>
</form>
