 <script lang="ts">
	import type { Snippet } from 'svelte';
	import type { PublicBusiness } from './types';

	let { children, business }: { business: PublicBusiness; children: Snippet } = $props();

	let prefersDark = $state(false);

	$effect(() => {
		const mq = window.matchMedia('(prefers-color-scheme: dark)');
		prefersDark = mq.matches;
		const handler = (e: MediaQueryListEvent) => (prefersDark = e.matches);
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	});

	const LIGHT_CSS = [
		'--background: oklch(1 0 0)',
		'--foreground: oklch(0.145 0.008 326)',
		'--muted-foreground: oklch(0.542 0.034 322.5)',
		'--border: oklch(0.922 0.005 325.62)',
		'--muted: oklch(0.96 0.003 325.6)',
		'--accent: oklch(0.96 0.003 325.6)',
		'--accent-foreground: oklch(0.212 0.019 322.12)',
		'--card: oklch(1 0 0)',
		'--card-foreground: oklch(0.145 0.008 326)',
		'--primary: oklch(0.457 0.24 277.023)',
		'--primary-foreground: oklch(0.962 0.018 272.314)',
		'--secondary: oklch(0.967 0.001 286.375)',
		'--secondary-foreground: oklch(0.21 0.006 285.885)',
		'--popover: oklch(1 0 0)',
		'--popover-foreground: oklch(0.145 0.008 326)',
		'--destructive: oklch(0.577 0.245 27.325)',
		'--ring: oklch(0.711 0.019 323.02)',
		'--sidebar: oklch(0.985 0 0)',
		'--sidebar-foreground: oklch(0.145 0.008 326)'
	].join('; ');

	const DARK_CSS = [
		'--background: oklch(0.145 0.008 326)',
		'--foreground: oklch(0.985 0 0)',
		'--muted-foreground: oklch(0.711 0.019 323.02)',
		'--border: oklch(1 0 0 / 10%)',
		'--muted: oklch(0.263 0.024 320.12)',
		'--accent: oklch(0.263 0.024 320.12)',
		'--accent-foreground: oklch(0.985 0 0)',
		'--card: oklch(0.212 0.019 322.12)',
		'--card-foreground: oklch(0.985 0 0)',
		'--primary: oklch(0.398 0.195 277.366)',
		'--primary-foreground: oklch(0.962 0.018 272.314)',
		'--secondary: oklch(0.274 0.006 286.033)',
		'--secondary-foreground: oklch(0.985 0 0)',
		'--popover: oklch(0.212 0.019 322.12)',
		'--popover-foreground: oklch(0.985 0 0)',
		'--destructive: oklch(0.704 0.191 22.216)',
		'--ring: oklch(0.542 0.034 322.5)',
		'--sidebar: oklch(0.212 0.019 322.12)',
		'--sidebar-foreground: oklch(0.985 0 0)'
	].join('; ');

	const themeStyle = $derived(
		business?.brandApperanceDetails.theme == 'light'
			? LIGHT_CSS
			: business?.brandApperanceDetails.theme == 'dark'
				? DARK_CSS
				: prefersDark
					? DARK_CSS
					: LIGHT_CSS
	);
</script>

<div class="min-h-screen bg-background text-foreground" style={themeStyle}>
	{@render children()}
</div>
