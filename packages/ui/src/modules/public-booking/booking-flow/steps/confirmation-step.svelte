<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import Check from '@tabler/icons-svelte/icons/check';
	import { formatDuration } from '../../utils/format';
	import type { PublicService, PublicSlot, PublicTeamMember } from '../../types';

	let {
		service,
		teamMember,
		slot,
		timeZone,
		bookingReference,
		showBookAnotherAppointmentButton,
		onBookAnother
	}: {
		service: PublicService;
		teamMember: PublicTeamMember | null;
		slot: PublicSlot;
		timeZone: string;
		bookingReference: string;
		showBookAnotherAppointmentButton: boolean;
		onBookAnother: () => void;
	} = $props();

	const formattedDateTime = $derived(
		new Intl.DateTimeFormat('en-US', {
			weekday: 'long',
			month: 'long',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit',
			timeZone
		}).format(new Date(slot.startTime))
	);
</script>

<div class="flex flex-col items-center gap-4 py-6 text-center">
	<div class="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
		<Check size={22} />
	</div>

	<div class="flex flex-col gap-1">
		<h2 class="text-lg font-semibold">Booking confirmed</h2>
		<p class="text-sm text-muted-foreground">
			We've sent a confirmation to your email. Reference: {bookingReference}
		</p>
	</div>

	<div class="flex w-full max-w-sm flex-col gap-2 border p-4 text-left text-sm">
		<div class="flex justify-between">
			<span class="text-muted-foreground">Service</span>
			<span class="font-medium">{service.title}</span>
		</div>
		<div class="flex justify-between">
			<span class="text-muted-foreground">Duration</span>
			<span class="font-medium">{formatDuration(service.durationInMins)}</span>
		</div>
		<div class="flex justify-between">
			<span class="text-muted-foreground">When</span>
			<span class="font-medium">{formattedDateTime}</span>
		</div>
		<div class="flex justify-between">
			<span class="text-muted-foreground">With</span>
			<span class="font-medium">
				{teamMember ? `${teamMember.name.firstName} ${teamMember.name.lastName}` : 'Any available'}
			</span>
		</div>
	</div>

	{#if showBookAnotherAppointmentButton}
		<Button variant="outline" onclick={onBookAnother}>Book another appointment</Button>
	{/if}
</div>
