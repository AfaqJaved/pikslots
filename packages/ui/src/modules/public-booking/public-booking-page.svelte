<script lang="ts">
	import PublicNav, { type PublicTabId } from './header/public-nav.svelte';
	import Banner from './header/banner.svelte';
	import BusinessInfoCard from './sidebar/business-info-card.svelte';
	import ServicesSection from './sections/services-section.svelte';
	import TeamSection from './sections/team-section.svelte';
	import GallerySection from './sections/gallery-section.svelte';
	import GalleryLightbox from './sections/gallery-lightbox.svelte';
	import ReviewsSection from './sections/reviews-section.svelte';
	import BookingFlow from './booking-flow/booking-flow.svelte';
	import { createBookingFlowState } from './booking-flow/booking-flow-state.svelte';
	import type { PublicService, PublicServiceGroup, PublicTeamMember } from './types';
	import { createQuery } from '@tanstack/svelte-query';
	import { getBookingPageDetailsQueryOptions } from '../api/public-booking-page/get.booking.page.details.by.business.query';
	import UngroupedServicesSection from './sections/ungrouped-service-section.svelte';
	import BookingPageWrapper from './booking-theme-wrapper.svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	let { slug }: { slug: string } = $props();

	const flow = createBookingFlowState();

	let view = $state<'browse' | 'booking'>('browse');
	let activeTab = $state<PublicTabId>('services');
	let galleryLightboxOpen = $state(false);
	let policyDismissed = $state(false);
	let memberServiceGroups = $state<PublicServiceGroup[] | null>(null);
	let memberUngroupedServices = $state<PublicService[] | null>(null);

	//______query____________________________
	const bookingPageDetailsQuery = createQuery(() => ({
		...getBookingPageDetailsQueryOptions(slug),
		enabled: !!slug
	}));

	//_____derived____________________________

	const business = $derived(bookingPageDetailsQuery.data?.business);
	const galleryPhotos = $derived(
		bookingPageDetailsQuery.data?.business.brandApperanceDetails.gallaryPhotosUrls ?? []
	);
	const ungroupedServices = $derived(bookingPageDetailsQuery.data?.services.services ?? []);
	const serviceGroups = $derived(bookingPageDetailsQuery.data?.services.groups ?? []);
	let allServiceGroups = $derived(
		ungroupedServices.length > 0
			? [...serviceGroups, { id: 'ungrouped', name: 'OTHER', services: ungroupedServices }]
			: serviceGroups
	);
	const teamMembers = $derived(bookingPageDetailsQuery.data?.teamMembers ?? []);

	let policy = $derived(
		!!(
			business?.bookingPolicies.showPolicyOnBookingPage &&
			business.bookingPolicies.bookingPolicyText &&
			!policyDismissed
		)
	);

	const tabs = $derived(
		(
			[
				{
					id: 'services',
					label: business?.bookingLabelOverrides.service || 'Services',
					visible: business?.bookingSetup.servicesSectionVisible ?? false
				},
				{
					id: 'team',
					label: business?.bookingLabelOverrides.teamMember || 'Team',
					visible: business?.bookingSetup.ourTeamSectionVisible ?? false
				},
				{ id: 'gallery', label: 'Gallery', visible: galleryPhotos.length > 0 },
				{ id: 'reviews', label: 'Reviews', visible: true }
			] satisfies { id: PublicTabId; label: string; visible: boolean }[]
		).filter((tab) => tab.visible)
	);

	function handleNavSelect(tab: PublicTabId) {
		activeTab = tab;
		view = 'browse';
		requestAnimationFrame(() => {
			document
				.getElementById(`section-${tab}`)
				?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		});
	}

	function handleSelectService(service: PublicService) {
		memberServiceGroups = null;
		memberUngroupedServices = null;
		flow.startWithService(service);
		view = 'booking';
	}

	function handleSelectTeamMember(member: PublicTeamMember) {
		if (member.serviceIds && member.serviceIds.length > 0) {
			memberServiceGroups = handleTeamMemberServices(member.serviceIds, allServiceGroups);
			memberUngroupedServices = ungroupedServices.filter((service) =>
				member.serviceIds!.includes(service.id)
			);
		} else {
			memberServiceGroups = null;
			memberUngroupedServices = null;
		}
		flow.startWithTeamMember(member);
		view = 'booking';
	}

	/** parse user (team member) services */
	function handleTeamMemberServices(
		serviceIds: string[],
		allServices: PublicServiceGroup[]
	): PublicServiceGroup[] {
		if (!serviceIds || serviceIds.length === 0) return [];
		return allServices
			.map((group) => ({
				...group,
				services: group.services.filter((service) => serviceIds.includes(service.id))
			}))
			.filter((group) => group.services.length > 0);
	}

	function handleBook() {
		memberServiceGroups = null;
		memberUngroupedServices = null;
		flow.startBlank();
		view = 'booking';
	}

	function handleCloseBooking() {
		memberServiceGroups = null;
		memberUngroupedServices = null;
		view = 'browse';
	}
</script>

{#if business !== undefined}
	<BookingPageWrapper {business}>
		{#if view === 'browse'}
			<PublicNav {activeTab} {tabs} onSelect={handleNavSelect} />
		{/if}
		{#if business}
			<Banner {business} />
		{/if}
		<div
			class="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 lg:flex-row lg:gap-10 lg:px-6 lg:py-8"
		>
			{#if view === 'booking'}
				{#if business && serviceGroups && teamMembers}
					<div class="mx-auto w-full max-w-2xl">
						<BookingFlow
							{flow}
							{business}
							serviceGroups={memberServiceGroups ?? allServiceGroups}
							ungroupedService={memberUngroupedServices ?? ungroupedServices}
							{teamMembers}
							onClose={handleCloseBooking}
						/>
					</div>
				{/if}
			{:else}
				<div class="flex flex-1 flex-col gap-2">
					{#if policy}
						<div class="felx-row mb-6 gap-10 rounded-xl" style="background-color: #1a1a1a">
							<p class="px-4 py-2 text-lg font-bold text-white">Our Booking Policy</p>
							<p class="px-4 py-2 text-sm text-muted-foreground">
								{business.bookingPolicies.bookingPolicyText}
							</p>

							<div class="flex justify-end p-4">
								<Button
									class=" w-fit rounded-full border-2 border-amber-50 bg-black px-6 py-2 text-sm lg:px-8 lg:py-4 lg:text-base"
									onclick={() => (policyDismissed = true)}>Okay</Button
								>
							</div>
						</div>
					{/if}
					{#if !business.bookingSetup.bookAppointmentSectionVisible}
						<div
							class="mb-6 rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-500"
						>
							Online Booking isn't available at the moment - please try again later.
						</div>
					{:else}
						{#if business && business.bookingSetup.servicesSectionVisible && serviceGroups.length > 0}
							<section id="section-services">
								<ServicesSection
									serviceGroups={allServiceGroups}
									label={business.bookingLabelOverrides.service}
									currency={business.locationDetails.currency}
									showPrices={business.bookingCustomization.showServiceAndClassPrices}
									showDuration={business.bookingCustomization.showServiceAndClassDuration}
									onSelectService={handleSelectService}
								/>
							</section>
						{/if}

						{#if business && business.bookingSetup.servicesSectionVisible && serviceGroups.length == 0 && ungroupedServices}
							<section id="section-services">
								<UngroupedServicesSection
									services={ungroupedServices}
									label={business.bookingLabelOverrides.service}
									currency={business.locationDetails.currency}
									showPrices={business.bookingCustomization.showServiceAndClassPrices}
									showDuration={business.bookingCustomization.showServiceAndClassDuration}
									onSelectService={handleSelectService}
								/>
							</section>
						{/if}
					{/if}

					{#if business && (business.bookingSetup.ourTeamSectionVisible || business.bookingSetup.skipTeamSelection)}
						<section id="section-team">
							<TeamSection
								{teamMembers}
								label={business.bookingLabelOverrides.teamMember}
								bookingPolicyText={business.bookingPolicies.bookingPolicyText}
								cancellationPolicyValue={business.bookingPolicies.cancellationPolicy?.value}
								cancellationPolicyUnit={business.bookingPolicies.cancellationPolicy?.unit}
								onSelectTeamMember={handleSelectTeamMember}
							/>
						</section>
					{/if}

					<section id="section-gallery">
						<GallerySection
							photos={galleryPhotos}
							onShowAllPhotos={() => (galleryLightboxOpen = true)}
						/>
					</section>

					<section id="section-reviews">
						<ReviewsSection />
					</section>
				</div>
				{#if business}
					<aside class="order-first w-full shrink-0 lg:order-last lg:w-80">
						<div class="lg:sticky lg:top-20">
							<BusinessInfoCard {business} onBook={handleBook} />
						</div>
					</aside>
				{/if}
			{/if}
		</div>
	</BookingPageWrapper>
{/if}

<GalleryLightbox bind:open={galleryLightboxOpen} photos={galleryPhotos} />
