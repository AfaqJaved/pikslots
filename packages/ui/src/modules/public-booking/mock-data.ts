import type { BusinessResponse } from '@pikslots/shared';
import type { PublicGalleryPhoto, PublicServiceGroup, PublicTeamMember } from './types';

/**
 * Mock fixture for the public booking page. Shaped exactly like `BusinessResponse`
 * (the real `GET /businesses/:id` response) so a future public "get business by slug"
 * endpoint can replace this without touching any presentational component.
 */
export function getMockBusiness(slug: string): BusinessResponse {
	const now = new Date();
	return {
		id: 'mock-business-id',
		ownerId: 'mock-owner-id',
		slug,
		name: 'Afaq',
		industry: 'other',
		about:
			'Full-stack engineering and developer relations — code reviews, architecture consults, and 1:1 mentoring sessions.',
		appearInSearchResults: true,
		status: 'active',
		suspendedReason: null,
		brandDetail: {
			bannerImageUrl: '',
			brandLogoUrl: ''
		},
		brandAppearanceDetails: {
			brandColor: '#7c3aed',
			brandButtonShape: 'rounded',
			theme: 'dark',
			gallaryPhotosUrls: []
		},
		locationDetails: {
			address: '',
			city: '',
			state: '',
			zip: '',
			country: '',
			currency: 'USD',
			timeZone: 'UTC',
			language: 'en'
		},
		bookingPolicies: {
			leadTime: { unit: 'days', value: 0 },
			scheduleWindow: { unit: 'days', value: 30 },
			cancellationPolicy: { unit: 'hours', value: 24 },
			bookingPolicyText:
				'Please arrive 5 minutes early. Cancellations within 24 hours of the appointment are non-refundable.',
			showPolicyOnBookingPage: true
		},
		bookingSetup: {
			bookAppointmentSectionVisible: true,
			bookClassSectionVisible: false,
			aboutUsSectionVisible: true,
			ourTeamSectionVisible: true,
			servicesSectionVisible: true,
			classesSectionVisible: false,
			showFirstAvailable: false,
			skipTeamSelection: false,
			allowToBookMultipleServices: false,
			bypassTeamMemberSelection: false,
			customerLoginEnabled: false,
			customerLoginRequired: false,
			hidePikslotsBranding: false,
			accordionView: true,
			allowRescheduling: true,
			allowCancellations: true,
			showBookNewButton: true
		},
		bookingContactFields: {
			name: { enabled: true, required: true },
			email: { enabled: true, required: false },
			phone: { enabled: true, required: true },
			address: { enabled: false, required: false },
			customFields: []
		},
		bookingCustomization: {
			language: 'en',
			timeFormat: '12 hours',
			weekStartsOn: 'sunday',
			showBookAnotherAppointmentButton: true,
			showServiceAndClassPrices: true,
			showServiceAndClassDuration: true,
			showBusinessHours: true,
			showLocalTime: true
		},
		bookingLabelOverrides: {
			service: 'Service',
			class: 'Class',
			teamMember: 'Team member',
			city: 'City',
			state: 'State',
			postalCode: 'Postal code',
			termsAndConditions: { label: '', link: '', requireTermsAcceptance: false },
			redirection: { label: '', link: '' }
		},
		businessHours: {
			sunday: { enabled: false, openTime: '09:00', closeTime: '17:00' },
			monday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
			tuesday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
			wednesday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
			thursday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
			friday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
			saturday: { enabled: false, openTime: '09:00', closeTime: '17:00' }
		},
		businessLinks: {
			Website: '',
			Facebook: '',
			Tiktok: '',
			X: '',
			Youtube: '',
			Instagram: '',
			LinkedIn: ''
		},
		contactDetails: {
			primaryEmail: 'hello@afaq.dev',
			primaryPhone: { countryCode: '+1', number: '5551234567' },
			additionalEmails: [],
			additionalPhones: []
		},
		teamNotifications: {
			notifyBookingConfirmation: true,
			notifyBookingChanges: true,
			notifyBookingCancellations: true,
			bookingRemindersTime: { active: true, type: 'email', unit: 'hours', value: 24 },
			extraCCEmails: []
		},
		customerNotifications: {
			notifyBookingConfirmation: true,
			notifyBookingChanges: true,
			notifyBookingCancellations: true,
			bookingRemindersTime: { active: true, type: 'email', unit: 'hours', value: 24 }
		},
		notificationCustomization: {
			emailSenderName: 'Afaq',
			emailSignature: ''
		},
		subscriptionPlan: 'pro',
		subscriptionStatus: 'active',
		trialEndsAt: null,
		createdAt: now,
		createdBy: 'mock-owner-id',
		updatedAt: now,
		updatedBy: 'mock-owner-id'
	};
}

export function getMockServiceGroups(): PublicServiceGroup[] {
	return [
		{
			id: 'group-test',
			name: 'TEST',
			services: [
				{
					id: 'service-15',
					title: '15 Minutes Meeting',
					description: 'A quick sync to discuss scope, blockers, or a fast code review.',
					images: [],
					durationInMins: 15,
					bufferTimeInMins: 5,
					cost: 0,
					isHiddenFromBookingPage: false,
					businessId: 'mock-business-id',
					colorCode: '#7c3aed'
				},
				{
					id: 'service-30',
					title: '30 Minutes Meeting',
					description: 'Standard consult — architecture questions, PR walkthroughs, planning.',
					images: [],
					durationInMins: 30,
					bufferTimeInMins: 5,
					cost: 0,
					isHiddenFromBookingPage: false,
					businessId: 'mock-business-id',
					colorCode: '#7c3aed'
				},
				{
					id: 'service-60',
					title: '1 Hour Meeting',
					description: 'Deep dive session — pairing, design review, or mentoring.',
					images: [],
					durationInMins: 60,
					bufferTimeInMins: 10,
					cost: 0,
					isHiddenFromBookingPage: false,
					businessId: 'mock-business-id',
					colorCode: '#7c3aed'
				}
			]
		}
	];
}

export function getMockTeamMembers(): PublicTeamMember[] {
	return [
		{
			id: 'user-1',
			name: { firstName: 'Afaq', lastName: 'Javed' },
			avatarUrl: null,
			role: 'Business Owner'
		},
		{
			id: 'user-2',
			name: { firstName: 'Afaq', lastName: 'Javaid' },
			avatarUrl: null,
			role: 'Standard'
		}
	];
}

export function getMockGalleryPhotos(): PublicGalleryPhoto[] {
	return [
		{
			id: 'photo-1',
			url: '',
			alt: 'Developer portfolio — engineering with depth',
			gradient: 'linear-gradient(135deg, #7c3aed 0%, #1e1b4b 60%, #0a0a0a 100%)'
		},
		{
			id: 'photo-2',
			url: '',
			alt: 'Developer portfolio — statistics and bio section',
			gradient: 'linear-gradient(135deg, #4c1d95 0%, #18181b 70%)'
		},
		{
			id: 'photo-3',
			url: '',
			alt: 'Workspace setup',
			gradient: 'linear-gradient(135deg, #6d28d9 0%, #111827 100%)'
		},
		{
			id: 'photo-4',
			url: '',
			alt: 'Team collaboration',
			gradient: 'linear-gradient(135deg, #5b21b6 0%, #0f172a 100%)'
		}
	];
}
