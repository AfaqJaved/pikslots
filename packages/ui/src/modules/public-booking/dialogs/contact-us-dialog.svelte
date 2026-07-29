<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Mail from '@tabler/icons-svelte/icons/mail';
	import Phone from '@tabler/icons-svelte/icons/phone';
	import InfoCircle from '@tabler/icons-svelte/icons/info-circle';
	import type { PublicBusiness } from '../types';

	let {
		open = $bindable(),
		business
	}: {
		open: boolean;
		business: PublicBusiness;
	} = $props();

	let isAdditionalPhoneNumberExist = $derived(
		business.contactDetails.additionalPhones.some((phone) => !!phone.countryCode && !!phone.number)
	);

	const hasContactDetails = $derived(() => {
		const { contactDetails } = business;

		const hasPrimaryPhone =
			!!contactDetails.primaryPhone.countryCode && !!contactDetails.primaryPhone.number;

		const hasAdditionalPhone = contactDetails.additionalPhones.some(
			(phone) => !!phone.countryCode && !!phone.number
		);

		return (
			!!contactDetails.primaryEmail ||
			hasPrimaryPhone ||
			contactDetails.additionalEmails.length > 0 ||
			hasAdditionalPhone
		);
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Contact Us</Dialog.Title>
		</Dialog.Header>

		{#if hasContactDetails()}
			<div class="flex flex-col gap-4">
				{#if business.contactDetails.primaryEmail}
					<div class="flex items-center gap-3">
						<Mail size={18} class="shrink-0 text-muted-foreground" />
						<a href={business.contactDetails.primaryEmail} class="text-sm hover:underline">
							{business.contactDetails.primaryEmail}
						</a>
					</div>
				{/if}

				{#if business.contactDetails.primaryPhone.number}
					<div class="flex items-center gap-3">
						<Phone size={18} class="shrink-0 text-muted-foreground" />
						<a
							href="tel:{business.contactDetails.primaryPhone.countryCode}{business.contactDetails
								.primaryPhone.number}"
							class="text-sm hover:underline"
						>
							{business.contactDetails.primaryPhone.countryCode}
							{business.contactDetails.primaryPhone.number}
						</a>
					</div>
				{/if}

				{#each business.contactDetails.additionalEmails as email (email)}
					<div class="flex items-center gap-3">
						<Mail size={18} class="shrink-0 text-muted-foreground" />
						<a href="mailto:{email}" class="text-sm hover:underline">{email}</a>
					</div>
				{/each}

				{#if isAdditionalPhoneNumberExist}
					{#each business.contactDetails.additionalPhones as phone (phone)}
						<div class="flex items-center gap-3">
							<Phone size={18} class="shrink-0 text-muted-foreground" />
							<a href="tel:{phone.countryCode}{phone.number}" class="text-sm hover:underline">
								{phone.countryCode}
								{phone.number}
							</a>
						</div>
					{/each}
				{/if}
			</div>
		{:else}
			<div class="flex flex-col items-center justify-center gap-3 py-8 text-muted-foreground">
				<InfoCircle size={40} class="text-muted-foreground/50" />
				<p class="text-sm">No contact details available</p>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
