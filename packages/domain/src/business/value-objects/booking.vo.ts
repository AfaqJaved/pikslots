import type { WeekDay } from '../../shared';
import type { TimeUnit } from '../types';

export interface StandardContactField {
  enabled: boolean;
  required: boolean;
}

export interface CustomContactField {
  label: string;
  enabled: boolean;
  required: boolean;
}

export interface BookingPolicies {
  leadTime: {
    unit: TimeUnit;
    value: number;
  };
  scheduleWindow: {
    unit: TimeUnit;
    value: number;
  };
  cancellationPolicy: {
    unit: TimeUnit;
    value: number;
  } | null;
  bookingPolicyText: string;
  showPolicyOnBookingPage: boolean;
}

export interface BookingSetup {
  bookAppointmentSectionVisible: boolean;
  bookClassSectionVisible: boolean;
  aboutUsSectionVisible: boolean;
  ourTeamSectionVisible: boolean;
  servicesSectionVisible: boolean;
  classesSectionVisible: boolean;
  showFirstAvailable: boolean;
  skipTeamSelection: boolean;
  allowToBookMultipleServices: boolean;
  bypassTeamMemberSelection: boolean;
  customerLoginEnabled: boolean;
  customerLoginRequired: boolean;
  hidePikslotsBranding: boolean;
  accordionView: boolean;
  allowRescheduling: boolean;
  allowCancellations: boolean;
  showBookNewButton: boolean;
}

export interface BookingContactFields {
  name: StandardContactField;
  email: StandardContactField;
  phone: StandardContactField;
  address: StandardContactField;
  customFields: CustomContactField[];
}

export interface BookingCustomization {
  language: string;
  timeFormat: '12 hours' | '24 hours';
  weekStartsOn: WeekDay;
  showBookAnotherAppointmentButton: boolean;
  showServiceAndClassPrices: boolean;
  showServiceAndClassDuration: boolean;
  showBusinessHours: boolean;
  showLocalTime: boolean;
}

export interface BookingLabelOverrides {
  service: string;
  class: string;
  teamMember: string;
  city: string;
  state: string;
  postalCode: string;
  termsAndConditions: {
    label: string;
    link: string;
    requireTermsAcceptance: boolean;
  };
  redirection: {
    label: string;
    link: string;
  };
}
