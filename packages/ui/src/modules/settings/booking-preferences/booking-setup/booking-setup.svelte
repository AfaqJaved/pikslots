<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import InfoCircle from '@tabler/icons-svelte/icons/info-circle';
	import Plus from '@tabler/icons-svelte/icons/plus';
	import { businessStore } from '../../../core/store/business.svelte';

	const business = $derived(businessStore.selectedBusiness);

	// ── Sections ───────────────────────────────────────────────────
	let sections = $state([
		{ label: 'Book appointment', key: 'bookAppointmentSectionVisible', enabled: true },
		{ label: 'Book class', key: 'bookClassSectionVisible', enabled: true },
		{ label: 'About us', key: 'aboutUsSectionVisible', enabled: true },
		{ label: 'Our team', key: 'ourTeamSectionVisible', enabled: true },
		{ label: 'Services', key: 'servicesSectionVisible', enabled: true },
		{ label: 'Classes', key: 'classesSectionVisible', enabled: true }
	]);

	// ── Booking flow ───────────────────────────────────────────────
	let firstAvailable = $state(false);
	let skipTeamMembers = $state(false);
	let multipleServices = $state(false);
	let anyTeamMember = $state(false);
	let customerLogin = $state(false);
	let customerLoginRequired = $state(false);
	let accordionView = $state(false);
	let allowRescheduling = $state(false);
	let allowCancellations = $state(false);
	let bookNewButton = $state(false);

	// ── Contact fields ─────────────────────────────────────────────
	let contactFields = $state([
		{ label: 'Name', enabled: true, required: true, locked: true },
		{ label: 'Phone', enabled: false, required: false, locked: false },
		{ label: 'Email', enabled: false, required: false, locked: false },
		{ label: 'Address', enabled: false, required: false, locked: false }
	]);

	$effect(() => {
		if (business) {
			const s = business.bookingSetup;
			const cf = business.bookingContactFields;

			sections = [
				{ label: 'Book appointment', key: 'bookAppointmentSectionVisible', enabled: s.bookAppointmentSectionVisible },
				{ label: 'Book class', key: 'bookClassSectionVisible', enabled: s.bookClassSectionVisible },
				{ label: 'About us', key: 'aboutUsSectionVisible', enabled: s.aboutUsSectionVisible },
				{ label: 'Our team', key: 'ourTeamSectionVisible', enabled: s.ourTeamSectionVisible },
				{ label: 'Services', key: 'servicesSectionVisible', enabled: s.servicesSectionVisible },
				{ label: 'Classes', key: 'classesSectionVisible', enabled: s.classesSectionVisible }
			];

			firstAvailable = s.showFirstAvailable;
			skipTeamMembers = s.skipTeamSelection;
			multipleServices = s.allowToBookMultipleServices;
			anyTeamMember = s.bypassTeamMemberSelection;
			customerLogin = s.customerLoginEnabled;
			customerLoginRequired = s.customerLoginRequired;
			accordionView = s.accordionView;
			allowRescheduling = s.allowRescheduling;
			allowCancellations = s.allowCancellations;
			bookNewButton = s.showBookNewButton;

			contactFields = [
				{ label: 'Name', enabled: cf.name.enabled, required: cf.name.required, locked: true },
				{ label: 'Phone', enabled: cf.phone.enabled, required: cf.phone.required, locked: false },
				{ label: 'Email', enabled: cf.email.enabled, required: cf.email.required, locked: false },
				{ label: 'Address', enabled: cf.address.enabled, required: cf.address.required, locked: false }
			];
		}
	});
</script>

<div class="flex flex-col">
	<!-- Page header -->
	<div class="flex items-center justify-between border-b px-6 py-4">
		<h1 class="text-base font-semibold">Booking preferences</h1>
		<Button>Save</Button>
	</div>

	<div class="flex w-[60%] flex-col gap-6 px-6 py-4">

		<!-- Booking setup heading -->
		<h2 class="text-sm font-semibold">Booking setup</h2>

		<!-- Sections -->
		<div class="flex flex-col gap-3">
			<div class="flex flex-col gap-0.5">
				<span class="text-xs font-medium">Sections</span>
				<span class="text-xs text-muted-foreground">What sections will be visible to your Booking Page visitors?</span>
			</div>
			<div class="flex flex-col gap-2.5">
				{#if business === null}
					{#each Array(6) as _}
						<div class="flex items-center gap-3">
							<Skeleton class="h-5 w-9 rounded-full" />
							<Skeleton class="h-3.5 w-28 rounded" />
						</div>
					{/each}
				{:else}
					{#each sections as section (section.label)}
						<div class="flex items-center gap-3">
							<Switch bind:checked={section.enabled} />
							<span class="text-xs">{section.label}</span>
						</div>
					{/each}
				{/if}
			</div>
		</div>

		<!-- Booking flow -->
		<div class="flex flex-col gap-3">
			<div class="flex flex-col gap-0.5">
				<span class="text-xs font-medium">Booking flow</span>
				<span class="text-xs text-muted-foreground">Streamline the scheduling experience to fill your calendar faster.</span>
			</div>

			<div class="flex flex-col gap-2.5">
				{#if business === null}
					{#each Array(9) as _}
						<div class="flex items-center gap-3">
							<Skeleton class="h-5 w-9 rounded-full" />
							<Skeleton class="h-3.5 w-36 rounded" />
						</div>
					{/each}
				{:else}
					<!-- First available appointment -->
					<div class="flex items-center gap-3">
						<Switch bind:checked={firstAvailable} />
						<span class="text-xs">First available appointment</span>
						<InfoCircle size={14} class="text-muted-foreground" />
					</div>

					<!-- Skip team members -->
					<div class="flex items-center gap-3">
						<Switch bind:checked={skipTeamMembers} />
						<span class="text-xs">Skip team members</span>
						<InfoCircle size={14} class="text-muted-foreground" />
					</div>

					<!-- Provide multiple services -->
					<div class="flex items-center gap-3">
						<Switch bind:checked={multipleServices} />
						<span class="text-xs">Provide multiple services</span>
						<InfoCircle size={14} class="text-muted-foreground" />
					</div>

					<!-- Any team member -->
					<div class="flex items-center gap-3">
						<Switch bind:checked={anyTeamMember} />
						<span class="text-xs">Any team member</span>
						<InfoCircle size={14} class="text-muted-foreground" />
					</div>

					<!-- Customer login + Required -->
					<div class="flex items-center gap-3">
						<Switch bind:checked={customerLogin} />
						<span class="text-xs">Customer login</span>
						<InfoCircle size={14} class="text-muted-foreground" />
						<div class="ml-auto flex items-center gap-2">
							<span class="text-xs text-muted-foreground">Required</span>
							<Switch bind:checked={customerLoginRequired} disabled={!customerLogin} />
						</div>
					</div>

					<!-- Accordion view -->
					<div class="flex items-center gap-3">
						<Switch bind:checked={accordionView} />
						<span class="text-xs">Accordion view</span>
						<InfoCircle size={14} class="text-muted-foreground" />
					</div>

					<!-- Allow online rescheduling -->
					<div class="flex items-center gap-3">
						<Switch bind:checked={allowRescheduling} />
						<span class="text-xs">Allow online rescheduling</span>
						<InfoCircle size={14} class="text-muted-foreground" />
					</div>

					<!-- Allow online cancellations -->
					<div class="flex items-center gap-3">
						<Switch bind:checked={allowCancellations} />
						<span class="text-xs">Allow online cancellations</span>
						<InfoCircle size={14} class="text-muted-foreground" />
					</div>

					<!-- 'Book new appointment' button -->
					<div class="flex items-center gap-3">
						<Switch bind:checked={bookNewButton} />
						<span class="text-xs">'Book new appointment' button</span>
						<InfoCircle size={14} class="text-muted-foreground" />
					</div>
				{/if}
			</div>
		</div>

		<!-- Contact fields -->
		<div class="flex flex-col gap-3">
			<div class="flex flex-col gap-0.5">
				<span class="text-xs font-medium">Contact fields</span>
				<span class="text-xs text-muted-foreground">What form fields will display when customers book online?</span>
			</div>

			<div class="flex flex-col gap-2.5">
				{#if business === null}
					{#each Array(4) as _}
						<div class="flex items-center gap-3">
							<Skeleton class="h-5 w-9 rounded-full" />
							<Skeleton class="h-3.5 w-20 rounded" />
							<div class="ml-auto flex items-center gap-2">
								<Skeleton class="h-3.5 w-14 rounded" />
								<Skeleton class="h-5 w-9 rounded-full" />
							</div>
						</div>
					{/each}
				{:else}
					{#each contactFields as field (field.label)}
						<div class="flex items-center gap-3">
							<Switch bind:checked={field.enabled} disabled={field.locked} />
							<span class="text-xs {field.locked ? 'text-muted-foreground' : ''}">{field.label}</span>
							<div class="ml-auto flex items-center gap-2">
								<span class="text-xs text-muted-foreground">Required</span>
								<Switch
									bind:checked={field.required}
									disabled={!field.enabled || field.locked}
									class={!field.enabled || field.locked ? 'opacity-40' : ''}
								/>
							</div>
						</div>
					{/each}
				{/if}
			</div>

			<Button variant="ghost" class="w-fit gap-1.5 px-0 text-xs font-medium">
				<Plus size={14} />
				Add field
			</Button>
		</div>

	</div>
</div>
