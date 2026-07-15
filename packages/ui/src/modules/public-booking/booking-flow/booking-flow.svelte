<script lang="ts">
	import ArrowLeft from '@tabler/icons-svelte/icons/arrow-left';
	import X from '@tabler/icons-svelte/icons/x';
	import SelectServiceStep from './steps/select-service-step.svelte';
	import SelectTeamMemberStep from './steps/select-team-member-step.svelte';
	import SelectDatetimeStep from './steps/select-datetime-step.svelte';
	import ContactDetailsStep from './steps/contact-details-step.svelte';
	import ConfirmationStep from './steps/confirmation-step.svelte';
	import { resolveTeamStep } from './resolve-team-step';
	import type { BookingFlowState } from './booking-flow-state.svelte';
	import type {
		PublicBusiness,
		PublicService,
		PublicServiceGroup,
		PublicSlot,
		PublicTeamMember
	} from '../types';

	let {
		flow,
		business,
		serviceGroups,
		teamMembers,
		onClose
	}: {
		flow: BookingFlowState;
		business: PublicBusiness;
		serviceGroups: PublicServiceGroup[];
		teamMembers: PublicTeamMember[];
		onClose: () => void;
	} = $props();

	const teamStep = $derived(resolveTeamStep(business, teamMembers));

	// Both entry points (picking a service directly, or picking a team member
	// first) route through the 'team-member' step — auto-advance past it here
	// whenever it isn't actually needed, so the logic lives in one place.
	$effect(() => {
		if (flow.step === 'team-member' && (teamStep.skip || flow.selectedTeamMember)) {
			if (!flow.selectedTeamMember) flow.selectedTeamMember = teamStep.defaultMember;
			flow.step = 'datetime';
		}
	});

	function handleServiceSelected(service: PublicService) {
		flow.selectedService = service;
		flow.step = 'team-member';
	}

	function handleTeamMemberSelected(member: PublicTeamMember | null) {
		flow.selectedTeamMember = member;
		flow.step = 'datetime';
	}

	function handleDatetimeSelected(date: string, slot: PublicSlot) {
		flow.selectedDate = date;
		flow.selectedSlot = slot;
		flow.step = 'contact';
	}

	function handleContactSubmit() {
		flow.bookingReference = `BK${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
		flow.step = 'confirmation';
	}

	function handleBack() {
		if (flow.step === 'service') {
			onClose();
		} else {
			flow.goToPreviousStep(teamStep.skip || !!flow.selectedTeamMember);
		}
	}

	function handleBookAnother() {
		flow.reset();
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<button
			type="button"
			onclick={handleBack}
			class="flex cursor-pointer items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
		>
			<ArrowLeft size={16} />
			Back
		</button>
		{#if flow.step !== 'confirmation'}
			<button
				type="button"
				onclick={onClose}
				class="cursor-pointer text-muted-foreground hover:text-foreground"
			>
				<X size={18} />
			</button>
		{/if}
	</div>

	{#if flow.step === 'service'}
		<SelectServiceStep
			{serviceGroups}
			currency={business.locationDetails.currency}
			showPrices={business.bookingCustomization.showServiceAndClassPrices}
			showDuration={business.bookingCustomization.showServiceAndClassDuration}
			onSelect={handleServiceSelected}
		/>
	{:else if flow.step === 'team-member'}
		<SelectTeamMemberStep {teamMembers} onSelect={handleTeamMemberSelected} />
	{:else if flow.step === 'datetime' && flow.selectedService}
		<SelectDatetimeStep
			durationInMins={flow.selectedService.durationInMins}
			bufferTimeInMins={flow.selectedService.bufferTimeInMins}
			businessHours={business.businessHours}
			timeZone={business.locationDetails.timeZone}
			onSelect={handleDatetimeSelected}
		/>
	{:else if flow.step === 'contact'}
		<ContactDetailsStep
			contact={flow.contact}
			fields={business.bookingContactFields}
			onSubmit={handleContactSubmit}
		/>
	{:else if flow.step === 'confirmation' && flow.selectedService && flow.selectedSlot && flow.bookingReference}
		<ConfirmationStep
			service={flow.selectedService}
			teamMember={flow.selectedTeamMember}
			slot={flow.selectedSlot}
			timeZone={business.locationDetails.timeZone}
			bookingReference={flow.bookingReference}
			showBookAnotherAppointmentButton={business.bookingCustomization
				.showBookAnotherAppointmentButton}
			onBookAnother={handleBookAnother}
		/>
	{/if}
</div>
