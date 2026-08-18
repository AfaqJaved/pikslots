<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod4 as zod } from 'sveltekit-superforms/adapters';
	import { businessOwnerSchema, type BusinessOwnerFormValues } from '../utils/schema';
	import { untrack } from 'svelte';
	import { FieldGroup, Field, FieldLabel, FieldError } from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	let {
		values,
		onNext,
		onBack
	}: { values: BusinessOwnerFormValues; onNext: () => void; onBack: () => void } = $props();

	const form = superForm<BusinessOwnerFormValues>(
		untrack(() => ({ ...values })),
		{
			SPA: true,
			validators: zod(businessOwnerSchema),
			onSubmit: async ({ cancel }) => {
				const result = await form.validateForm({ update: true });
				if (!result.valid) {
					cancel();
					return;
				}
				Object.assign(values, result.data);
				onNext();
			}
		}
	);

	const { form: formData, errors, enhance, submitting } = form;
	const isValid = $derived(businessOwnerSchema.safeParse($formData).success);
</script>

<form method="POST" use:enhance class="flex flex-col gap-6">
	<FieldGroup>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<Field>
				<FieldLabel for="biz_first_name">First name</FieldLabel>
				<Input
					id="biz_first_name"
					name="first_name"
					bind:value={$formData.first_name}
					placeholder="Jane"
				/>
				<FieldError errors={$errors.first_name?.map((e) => ({ message: e }))} />
			</Field>
			<Field>
				<FieldLabel for="biz_last_name">Last name</FieldLabel>
				<Input
					id="biz_last_name"
					name="last_name"
					bind:value={$formData.last_name}
					placeholder="Doe"
				/>
				<FieldError errors={$errors.last_name?.map((e) => ({ message: e }))} />
			</Field>
		</div>

		<Field>
			<FieldLabel for="biz_email">Email</FieldLabel>
			<Input
				id="biz_email"
				name="email"
				type="email"
				bind:value={$formData.email}
				placeholder="jane@example.com"
			/>
			<FieldError errors={$errors.email?.map((e) => ({ message: e }))} />
		</Field>

		<Field>
			<FieldLabel for="biz_phone"
				>Phone <span class="text-muted-foreground">(optional)</span></FieldLabel
			>
			<Input
				id="biz_phone"
				name="phone"
				type="number"
				bind:value={$formData.phone}
				placeholder="+1 555 000 0000"
			/>
			<FieldError errors={$errors.phone?.map((e) => ({ message: e }))} />
		</Field>

		<Field>
			<FieldLabel for="biz_username">Username</FieldLabel>
			<Input
				id="biz_username"
				name="username"
				bind:value={$formData.username}
				placeholder="janedoe"
			/>
			<FieldError errors={$errors.username?.map((e) => ({ message: e }))} />
		</Field>

		<Field>
			<FieldLabel for="biz_password">Password</FieldLabel>
			<Input
				id="biz_password"
				name="password"
				type="password"
				bind:value={$formData.password}
				placeholder="••••••••"
			/>
			<FieldError errors={$errors.password?.map((e) => ({ message: e }))} />
		</Field>

		<Field>
			<div class="flex items-center justify-end gap-4">
				<Button type="button" variant="outline" onclick={onBack}>Back</Button>
				<Button type="submit" disabled={!isValid}>
					{$submitting ? 'Saving...' : 'Continue'}
				</Button>
			</div>
		</Field>
	</FieldGroup>
</form>
