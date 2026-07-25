import type {
	BusinessDetails,
	Service,
	ServiceGroups,
	SlotResponse,
	TeamMemberDetails
} from '@pikslots/shared';

/**
 * These aliases mirror the real `@pikslots/shared` API response shapes so mock
 * data here is a drop-in replacement target once real public endpoints exist.
 */

export type PublicBusiness = BusinessDetails;

export type PublicService = Service;

export type PublicServiceGroup = ServiceGroups;

export type PublicTeamMember = TeamMemberDetails;

export type PublicSlot = SlotResponse;

export type PublicGalleryPhoto = string[];
