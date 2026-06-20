import { businessStore } from './business.svelte.js';

type Locale = 'en' | 'ru';

const SUPPORTED: Locale[] = ['en', 'ru'];

function createLocaleStore() {
	// Derived from business settings (persisted in DB via settings > general).
	// TODO: once locale is added to the JWT payload, swap this to:
	// authStore.getPayloadData()?.locale ?? 'en'
	const value = $derived<Locale>(
		SUPPORTED.includes(businessStore.selectedBusiness?.locationDetails?.language as Locale)
			? (businessStore.selectedBusiness!.locationDetails.language as Locale)
			: 'en'
	);

	return {
		get value() {
			return value;
		}
	};
}

export const localeStore = createLocaleStore();
