import type { PublicBusiness, PublicTeamMember } from '../types';

export interface TeamStepResolution {
	skip: boolean;
	defaultMember: PublicTeamMember | null;
}

/** Whether the wizard should skip asking the customer to pick a team member. */
export function resolveTeamStep(
	business: PublicBusiness,
	teamMembers: PublicTeamMember[]
): TeamStepResolution {
	const skip =
		business.bookingSetup.bypassTeamMemberSelection ||
		business.bookingSetup.skipTeamSelection ||
		teamMembers.length <= 1;
	return { skip, defaultMember: skip ? (teamMembers[0] ?? null) : null };
}
