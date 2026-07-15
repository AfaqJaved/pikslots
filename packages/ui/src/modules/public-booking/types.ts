import type {
	BusinessResponse,
	ServiceResponse,
	SlotResponse,
	UserSummary
} from '@pikslots/shared';

/**
 * These aliases mirror the real `@pikslots/shared` API response shapes so mock
 * data here is a drop-in replacement target once real public endpoints exist.
 */

export type PublicBusiness = BusinessResponse;

export type PublicService = ServiceResponse;

export interface PublicServiceGroup {
	id: string;
	name: string;
	services: PublicService[];
}

export type PublicTeamMember = Pick<UserSummary, 'id' | 'name' | 'avatarUrl' | 'role'>;

export type PublicSlot = SlotResponse;

export interface PublicGalleryPhoto {
	id: string;
	/** Real photo URL. Empty when the business hasn't uploaded one yet — render `gradient` instead. */
	url: string;
	alt: string;
	/** CSS `background-image` fallback used while `url` is empty. */
	gradient: string;
}
