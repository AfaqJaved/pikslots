export interface PhoneEntry {
  countryCode: string;
  number: string;
}

export interface BusinessContactDetails {
  primaryEmail: string;
  primaryPhone: PhoneEntry;
  additionalEmails: string[];
  additionalPhones: PhoneEntry[];
}
