import type {
  BookingContactFields,
  BookingCustomization,
  BookingLabelOverrides,
  BookingPolicies,
  BookingSetup,
  BrandApperanceDetails,
  BrandDetails,
  BusinessHours,
  BusinessLinks,
  LocationDetails,
} from '../business';

// _________PublicBookingPageProps__________________________________________

export interface Services {
  id: string;
  title: string;
  description: string;
  serviceAvatar: string;
  durationInMins: number;
  bufferTimeInMins: number;
  cost: number;
  isHiddenFromBookingPage: boolean;
  colorCode: string;
}

export interface ServiceGroups {
  id: string;
  name: string;
  services: Services[];
}

export interface BusinessDetails {
  id: string;
  name: string;
  slug: string;
  about: string;
  brandDetail: BrandDetails;
  brandApperanceDetails: BrandApperanceDetails;
  bookingPolicies: BookingPolicies;
  locationDetails: LocationDetails;
  bookingSetup: BookingSetup;
  bookingContactFields: BookingContactFields;
  bookingCustomization: BookingCustomization;
  bookingLabelOverrides: BookingLabelOverrides;
  businessHours: BusinessHours;
  businessLinks: BusinessLinks;
}

export type ServicesDetails = {
  groups: ServiceGroups[];
  services: Services[];
};

export interface TeamMemberDetails {
  id: string;
  name: { firstName: string; lastName: string };
  avatarUrl: string | null;
  role: string;
}

export interface PublicBookingPage {
  business: BusinessDetails;
  services: ServicesDetails;
  teamMembers: TeamMemberDetails[];
}
