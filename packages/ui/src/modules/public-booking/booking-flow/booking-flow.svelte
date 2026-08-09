<script lang="ts">
	import ArrowLeft from '@tabler/icons-svelte/icons/arrow-left';
	import X from '@tabler/icons-svelte/icons/x';
	import SelectServiceStep from './steps/select-service-step.svelte';
	import SelectTeamMemberStep from './steps/select-team-member-step.svelte';
	import SelectDatetimeStep from './steps/select-datetime-step.svelte';
	import ContactDetailsStep from './steps/contact-details-step.svelte';
	import ConfirmationStep from './steps/confirmation-step.svelte';
	import UngroupedSerivice from './steps/select-ungrouped-service.svelte';
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
		ungroupedService,
		teamMembers,
		onClose
	}: {
		flow: BookingFlowState;
		business: PublicBusiness;
		serviceGroups: PublicServiceGroup[];
		ungroupedService: PublicService[];
		teamMembers: PublicTeamMember[];
		onClose: () => void;
	} = $props();

	const teamStep = $derived(resolveTeamStep(business, teamMembers));

	// Both entry points (picking a service directly, or picking a team member
	// first) route through the 'team-member' step — auto-advance past it here
	// whenever it isn't actually needed, so the logic lives in one place.
	$effect(() => {
		if (flow.step === 'team-member' && teamStep.skip) {
			if (!flow.selectedTeamMember) flow.selectedTeamMember = teamStep.defaultMember;
			flow.step = 'datetime';
		}
		flow.previousStep = 'first';
	});

	/** filter team member services */
	const filterServiceGroups = $derived(
		flow.selectedTeamMember?.serviceIds !== null ? serviceGroups : []
	);

	const filterUngroupedServices = $derived(
		flow.selectedTeamMember?.serviceIds !== null ? ungroupedService : []
	);

	const selectedMemberName = $derived(
		flow.selectedTeamMember
			? `${flow.selectedTeamMember.name.firstName} ${flow.selectedTeamMember.name.lastName}`
			: ''
	);

	const memberHasNoServices = $derived(
		flow.previousStep === 'first' &&
			!!flow.selectedTeamMember &&
			filterServiceGroups.length === 0 &&
			filterUngroupedServices.length === 0
	);

	function handleServiceSelected(service: PublicService) {
		flow.selectedService = service;
		flow.step = 'team-member';
	}

	function handleTeamMemberSelected(member: PublicTeamMember | null) {
		flow.selectedTeamMember = member;
		flow.step = 'member-service';
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
		if (flow.step === 'service' || (flow.previousStep == 'first' && flow.step === 'team-member')) {
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

	{#if flow.step === 'service' || flow.step === 'member-service'}
		{#if serviceGroups && serviceGroups.length > 0 && !memberHasNoServices}
			<SelectServiceStep
				serviceGroups={flow.previousStep === 'first' ? filterServiceGroups : serviceGroups}
				label={business.bookingLabelOverrides.service}
				currency={business.locationDetails.currency}
				showPrices={business.bookingCustomization.showServiceAndClassPrices}
				showDuration={business.bookingCustomization.showServiceAndClassDuration}
				unavailable={!business.bookingSetup.bookAppointmentSectionVisible}
				onSelect={handleServiceSelected}
			/>
		{:else if ungroupedService && ungroupedService.length > 0 && !memberHasNoServices}
			<UngroupedSerivice
				services={flow.previousStep === 'first' ? filterUngroupedServices : ungroupedService}
				label={business.bookingLabelOverrides.service}
				currency={business.locationDetails.currency}
				showPrices={business.bookingCustomization.showServiceAndClassPrices}
				showDuration={business.bookingCustomization.showServiceAndClassDuration}
				unavailable={!business.bookingSetup.bookAppointmentSectionVisible}
				onSelect={handleServiceSelected}
			/>
		{:else if memberHasNoServices}
			<SelectServiceStep
				serviceGroups={[]}
				label={business.bookingLabelOverrides.service}
				currency={business.locationDetails.currency}
				showPrices={business.bookingCustomization.showServiceAndClassPrices}
				showDuration={business.bookingCustomization.showServiceAndClassDuration}
				unavailable={!business.bookingSetup.bookAppointmentSectionVisible}
				memberHasNoServices
				memberName={selectedMemberName}
				onSelect={handleServiceSelected}
			/>
		{/if}
	{:else if flow.step === 'team-member'}
		<SelectTeamMemberStep
			{teamMembers}
			{business}
			label={business.bookingLabelOverrides.teamMember}
			unavailable={!business.bookingSetup.bookAppointmentSectionVisible}
			onSelect={handleTeamMemberSelected}
		/>
	{:else if flow.step === 'datetime' && flow.selectedService}
		<SelectDatetimeStep
			durationInMins={flow.selectedService.durationInMins}
			bufferTimeInMins={flow.selectedService.bufferTimeInMins}
			businessHours={business.businessHours}
			timeZone={business.locationDetails.timeZone}
			serviceId={flow.selectedService.id}
			userId={flow.selectedTeamMember?.id ?? 'admin123'}
			{business}
			onSelect={handleDatetimeSelected}
		/>
	{:else if flow.step === 'contact'}
		<ContactDetailsStep
			contact={flow.contact}
			{business}
			fields={business.bookingContactFields}
			onSubmit={handleContactSubmit}
			brandColor={business.brandApperanceDetails.brandColor}
			buttonShape={business.brandApperanceDetails.brandButtonShape}
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
			{business}
			onBookAnother={handleBookAnother}
		/>
	{/if}
</div>
