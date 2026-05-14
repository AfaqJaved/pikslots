const STORAGE_KEY = 'theme';

function createThemeStore() {
	let theme = $state<'light' | 'dark'>('light');

	function applyTheme(t: 'light' | 'dark') {
		document.documentElement.classList.toggle('dark', t === 'dark');
	}

	function init() {
		if (typeof localStorage === 'undefined') return;
		const stored = localStorage.getItem(STORAGE_KEY) as 'light' | 'dark' | null;
		theme =
			stored ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
		applyTheme(theme);

		const mq = window.matchMedia('(prefers-color-scheme: dark)');
		const handler = (e: MediaQueryListEvent) => {
			if (!localStorage.getItem(STORAGE_KEY)) {
				theme = e.matches ? 'dark' : 'light';
				applyTheme(theme);
			}
		};
		mq.addEventListener('change', handler);
	}

	function toggle() {
		theme = theme === 'dark' ? 'light' : 'dark';
		localStorage.setItem(STORAGE_KEY, theme);
		applyTheme(theme);
	}

	function set(t: 'light' | 'dark') {
		theme = t;
		localStorage.setItem(STORAGE_KEY, t);
		applyTheme(t);
	}

	return {
		get current() {
			return theme;
		},
		init,
		toggle,
		set
	};
}

export const themeStore = createThemeStore();
