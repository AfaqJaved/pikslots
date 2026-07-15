<script lang="ts">
	import { Field, FieldGroup, FieldLabel } from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { BookingContactFields } from '@pikslots/shared';
	import type { ContactDetails } from '../booking-flow-state.svelte';

	let {
		contact,
		fields,
		onSubmit
	}: {
		contact: ContactDetails;
		fields: BookingContactFields;
		onSubmit: () => void;
	} = $props();

	const isValid = $derived(
		(!fields.name.required || contact.name.trim().length > 0) &&
			(!fields.email.required || contact.email.trim().length > 0) &&
			(!fields.phone.required || contact.phone.trim().length > 0)
	);
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-lg font-semibold">Your details</h2>

	<FieldGroup class="max-w-sm">
		{#if fields.name.enabled}
			<Field>
				<FieldLabel>Full name{fields.name.required ? ' *' : ''}</FieldLabel>
				<Input bind:value={contact.name} placeholder="Jane Doe" />
			</Field>
		{/if}

		{#if fields.email.enabled}
			<Field>
				<FieldLabel>Email{fields.email.required ? ' *' : ''}</FieldLabel>
				<Input type="email" bind:value={contact.email} placeholder="jane@example.com" />
			</Field>
		{/if}

		{#if fields.phone.enabled}
			<Field>
				<FieldLabel>Phone{fields.phone.required ? ' *' : ''}</FieldLabel>
				<Input type="tel" bind:value={contact.phone} placeholder="+1 555 123 4567" />
			</Field>
		{/if}
	</FieldGroup>

	<Button class="w-fit" disabled={!isValid} onclick={onSubmit}>Confirm booking</Button>
</div>
