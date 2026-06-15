<script lang="ts">
	import { localeStore } from '$lib/locale.svelte.js';

	const LOCALES = [
		{ tag: 'en', label: 'EN', full: 'English' },
		{ tag: 'ru', label: 'RU', full: 'Русский' }
	] as const;
</script>

<div class="flex items-center gap-1">
	{#each LOCALES as locale}
		<button
			type="button"
			onclick={() => localeStore.set(locale.tag)}
			title={locale.full}
			class="rounded px-2 py-1 text-xs font-medium transition-colors
				{localeStore.value === locale.tag
				? 'bg-primary text-primary-foreground'
				: 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
		>
			{locale.label}
		</button>
	{/each}
</div>
