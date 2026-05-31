export interface PhoneEntry {
  countryCode: string; // e.g. '+92'
  number: string;
}

export interface BusinessContactDetails {
  primaryEmail: string;
  primaryPhone: PhoneEntry;
  additionalEmails: string[];
  additionalPhones: PhoneEntry[];
}
