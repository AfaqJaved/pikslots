<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { themeStore } from '$lib/stores/theme.svelte.js';

	let { children } = $props();

	$effect(() => {
		themeStore.init(); // dark/light theme store
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
