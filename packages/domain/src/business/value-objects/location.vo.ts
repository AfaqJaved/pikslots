import type { SupportedCurrencies } from '../types';

export interface LocationDetails {
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  currency: SupportedCurrencies;
  timeZone: string;
  language: string;
}
