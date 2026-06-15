import { browser } from '$app/environment';

type Locale = 'en' | 'ru';

class LocaleStore {
	value = $state<Locale>('en');

	init() {
		if (!browser) return;
		const saved = localStorage.getItem('locale') as Locale | null;
		if (saved === 'en' || saved === 'ru') this.value = saved;
	}

	set(tag: Locale) {
		this.value = tag;
		if (browser) localStorage.setItem('locale', tag);
	}
}

export const localeStore = new LocaleStore();
