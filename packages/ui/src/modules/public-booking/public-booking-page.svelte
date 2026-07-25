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
	import type { PublicService, PublicTeamMember } from './types';
	import { createQuery } from '@tanstack/svelte-query';
	import { getBookingPageDetailsQueryOptions } from '../api/public-booking-page/get.booking.page.details.by.business.query';
	import UngroupedServicesSection from './sections/ungrouped-service-section.svelte';

	let { slug }: { slug: string } = $props();

	// const serviceGroups = getMockServiceGroups();
	// const teamMembers = getMockTeamMembers();
	// const galleryPhotos = getMockGalleryPhotos();

	const flow = createBookingFlowState();

	let view = $state<'browse' | 'booking'>('browse');
	let activeTab = $state<PublicTabId>('services');
	let galleryLightboxOpen = $state(false);

	//______query____________________________
	const bookingPageDetailsQuery = createQuery(() => ({
		...getBookingPageDetailsQueryOptions(slug),
		enabled: !!slug
	}));

	//_____derived_____________________________

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
	const tabs = $derived(
		(
			[
				{
					id: 'services',
					label: 'Services',
					visible: business?.bookingSetup.servicesSectionVisible ?? false
				},
				{
					id: 'team',
					label: 'Team',
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
		flow.startWithService(service);
		view = 'booking';
	}

	function handleSelectTeamMember(member: PublicTeamMember) {
		flow.startWithTeamMember(member);
		view = 'booking';
	}

	function handleBook() {
		flow.startBlank();
		view = 'booking';
	}

	function handleCloseBooking() {
		view = 'browse';
	}
</script>

<div class="min-h-screen bg-background">
	{#if view === 'browse'}
		<PublicNav {activeTab} {tabs} onSelect={handleNavSelect} />
	{/if}
	{#if business}
		<Banner {business} />
	{/if}
	<div class="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-8 lg:flex-row">
		{#if view === 'booking'}
			{#if business && serviceGroups && teamMembers}
				<div class="mx-auto w-full max-w-2xl">
					<BookingFlow
						{flow}
						{business}
						serviceGroups={allServiceGroups}
						ungroupedService={ungroupedServices}
						{teamMembers}
						onClose={handleCloseBooking}
					/>
				</div>
			{/if}
		{:else}
			<div class="flex flex-1 flex-col gap-10">
				{#if business && business.bookingSetup.servicesSectionVisible && serviceGroups.length > 0}
					<section id="section-services">
						<ServicesSection
							serviceGroups={allServiceGroups}
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
							currency={business.locationDetails.currency}
							showPrices={business.bookingCustomization.showServiceAndClassPrices}
							showDuration={business.bookingCustomization.showServiceAndClassDuration}
							onSelectService={handleSelectService}
						/>
					</section>
				{/if}

				{#if business && business.bookingSetup.ourTeamSectionVisible}
					<section id="section-team">
						<TeamSection
							{teamMembers}
							bookingPolicyText={business.bookingPolicies.bookingPolicyText}
							showPolicy={business.bookingPolicies.showPolicyOnBookingPage}
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
</div>

<GalleryLightbox bind:open={galleryLightboxOpen} photos={galleryPhotos} />
