import type { PublicService, PublicSlot, PublicTeamMember } from '../types';

export type BookingStep = 'service' | 'team-member' | 'datetime' | 'contact' | 'confirmation';

export interface ContactDetails {
	name: string;
	email: string;
	phone: string;
}

/** `null` team member selection means "Any available". */
export function createBookingFlowState() {
	let step = $state<BookingStep>('service');
	let selectedService = $state<PublicService | null>(null);
	let selectedTeamMember = $state<PublicTeamMember | null>(null);
	let selectedDate = $state<string | null>(null); // 'YYYY-MM-DD'
	let selectedSlot = $state<PublicSlot | null>(null);
	let contact = $state<ContactDetails>({ name: '', email: '', phone: '' });
	let bookingReference = $state<string | null>(null);

	function reset() {
		step = 'service';
		selectedService = null;
		selectedTeamMember = null;
		selectedDate = null;
		selectedSlot = null;
		contact = { name: '', email: '', phone: '' };
		bookingReference = null;
	}

	/**
	 * Enter the flow already knowing which service the customer wants.
	 * Always targets the team-member step first — `BookingFlow` auto-advances
	 * past it when the business/service config says to skip it.
	 */
	function startWithService(service: PublicService) {
		selectedService = service;
		step = 'team-member';
	}

	/** Enter the flow already knowing which team member the customer wants. */
	function startWithTeamMember(member: PublicTeamMember) {
		reset();
		selectedTeamMember = member;
		step = 'service';
	}

	/** Enter the flow via the sidebar "Book" button — nothing preselected yet. */
	function startBlank() {
		reset();
	}

	function goToPreviousStep(skipTeamMemberStep = false) {
		const order: BookingStep[] = skipTeamMemberStep
			? ['service', 'datetime', 'contact', 'confirmation']
			: ['service', 'team-member', 'datetime', 'contact', 'confirmation'];
		const index = order.indexOf(step);
		if (index > 0) step = order[index - 1];
	}

	return {
		get step() {
			return step;
		},
		set step(v: BookingStep) {
			step = v;
		},
		get selectedService() {
			return selectedService;
		},
		set selectedService(v: PublicService | null) {
			selectedService = v;
		},
		get selectedTeamMember() {
			return selectedTeamMember;
		},
		set selectedTeamMember(v: PublicTeamMember | null) {
			selectedTeamMember = v;
		},
		get selectedDate() {
			return selectedDate;
		},
		set selectedDate(v: string | null) {
			selectedDate = v;
		},
		get selectedSlot() {
			return selectedSlot;
		},
		set selectedSlot(v: PublicSlot | null) {
			selectedSlot = v;
		},
		get contact() {
			return contact;
		},
		get bookingReference() {
			return bookingReference;
		},
		set bookingReference(v: string | null) {
			bookingReference = v;
		},
		reset,
		startWithService,
		startWithTeamMember,
		startBlank,
		goToPreviousStep
	};
}

export type BookingFlowState = ReturnType<typeof createBookingFlowState>;
