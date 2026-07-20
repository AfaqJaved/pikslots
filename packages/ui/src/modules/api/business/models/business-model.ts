import type {
	BusinessResponse,
	RegisterBusinessInput,
	RegisterBusinessResponse,
	UpdateBusinessAppearanceInput,
	UpdateBusinessAppearanceResponse,
	UpdateBusinessBookingCustomizationInput,
	UpdateBusinessBookingCustomizationResponse,
	UpdateBusinessBookingPoliciesInput,
	UpdateBusinessBookingPoliciesResponse,
	UpdateBusinessBookingSetupInput,
	UpdateBusinessBookingSetupResponse,
	UpdateBusinessBrandDetailsInput,
	UpdateBusinessBrandDetailsResponse,
	UpdateBusinessGeneralInput,
	UpdateBusinessGeneralResponse,
	UpdateBusinessLocationInput,
	UpdateBusinessLocationResponse,
	UpdateBusinessTeamNotificationsInput,
	UpdateBusinessTeamNotificationsResponse,
	UpdateBusinessCustomerNotificationsInput,
	UpdateBusinessCustomerNotificationsResponse,
	UpdateBusinessNotificationCustomizationInput,
	UpdateBusinessNotificationCustomizationResponse,
	UpdateBusinessHoursInput,
	UpdateBusinessHoursResponse,
	UpdateBusinessVisibilityInput,
	UpdateBusinessVisibilityResponse,
	UpdateBusinessLinksInput,
	UpdateBusinessLinksResponse,
	UpdateBusinessContactDetailsInput,
	UpdateBusinessContactDetailsResponse,
	UpdateBusinessGalleryPhotosInput,
	UpdateBusinessBrandDetailsImagesInput
} from '@pikslots/shared';

export type BusinessModel = BusinessResponse;
export type BusinessCreateInput = RegisterBusinessInput;
export type BusinessCreateResult = RegisterBusinessResponse;
export type BusinessUpdateBrandDetailsInput = UpdateBusinessBrandDetailsInput & { id: string };
export type BusinessUpdateBrandDetailsResult = UpdateBusinessBrandDetailsResponse;
export type BusinessUpdateAppearanceInput = UpdateBusinessAppearanceInput & { id: string };
export type BusinessUpdateAppearanceResult = UpdateBusinessAppearanceResponse;
export type BusinessUpdateLocationInput = UpdateBusinessLocationInput & { id: string };
export type BusinessUpdateLocationResult = UpdateBusinessLocationResponse;
export type BusinessUpdateGeneralInput = UpdateBusinessGeneralInput & { id: string };
export type BusinessUpdateGeneralResult = UpdateBusinessGeneralResponse;
export type BusinessUpdateBookingPoliciesInput = UpdateBusinessBookingPoliciesInput & {
	id: string;
};
export type BusinessUpdateBookingPoliciesResult = UpdateBusinessBookingPoliciesResponse;
export type BusinessUpdateBookingSetupInput = UpdateBusinessBookingSetupInput & { id: string };
export type BusinessUpdateBookingSetupResult = UpdateBusinessBookingSetupResponse;
export type BusinessUpdateBookingCustomizationInput = UpdateBusinessBookingCustomizationInput & {
	id: string;
};
export type BusinessUpdateBookingCustomizationResult = UpdateBusinessBookingCustomizationResponse;
export type BusinessUpdateTeamNotificationsInput = UpdateBusinessTeamNotificationsInput & {
	id: string;
};
export type BusinessUpdateTeamNotificationsResult = UpdateBusinessTeamNotificationsResponse;
export type BusinessUpdateCustomerNotificationsInput = UpdateBusinessCustomerNotificationsInput & {
	id: string;
};
export type BusinessUpdateCustomerNotificationsResult = UpdateBusinessCustomerNotificationsResponse;
export type BusinessUpdateNotificationCustomizationInput =
	UpdateBusinessNotificationCustomizationInput & { id: string };
export type BusinessUpdateNotificationCustomizationResult =
	UpdateBusinessNotificationCustomizationResponse;
export type BusinessUpdateHoursInput = UpdateBusinessHoursInput & { id: string };
export type BusinessUpdateHoursResult = UpdateBusinessHoursResponse;
export type BusinessUpdateVisibilityInput = UpdateBusinessVisibilityInput & { id: string };
export type BusinessUpdateVisibilityResult = UpdateBusinessVisibilityResponse;
export type BusinessUpdateLinksInput = UpdateBusinessLinksInput & { id: string };
export type BusinessUpdateLinksResult = UpdateBusinessLinksResponse;
export type BusinessUpdateContactDetailsInput = UpdateBusinessContactDetailsInput & { id: string };
export type BusinessUpdateContactDetailsResult = UpdateBusinessContactDetailsResponse;
export type UpdateGalleryImagesInput = UpdateBusinessGalleryPhotosInput & { businessId: string };
export type BusinessUpdateBrandDetailsImages = UpdateBusinessBrandDetailsImagesInput & {
	businessId: string;
};
