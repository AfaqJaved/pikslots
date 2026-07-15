<script lang="ts">
	import Upload from '@tabler/icons-svelte/icons/upload';
	import User from '@tabler/icons-svelte/icons/user';

	export type PublicTabId = 'services' | 'team' | 'gallery' | 'reviews';

	let {
		activeTab,
		tabs,
		onSelect
	}: {
		activeTab: PublicTabId;
		tabs: { id: PublicTabId; label: string }[];
		onSelect: (tab: PublicTabId) => void;
	} = $props();
</script>

<header
	class="sticky top-0 z-20 mx-auto flex max-w-5xl items-center justify-between border-b bg-background px-6"
>
	<nav class="flex items-center gap-6">
		{#each tabs as tab (tab.id)}
			<button
				type="button"
				onclick={() => onSelect(tab.id)}
				class="cursor-pointer border-b-2 border-transparent py-4 text-sm font-medium text-muted-foreground transition-colors {activeTab ===
				tab.id
					? 'border-foreground text-foreground'
					: 'hover:text-foreground'}"
			>
				{tab.label}
			</button>
		{/each}
	</nav>

	<div class="flex items-center gap-2 py-3">
		<button
			type="button"
			title="Share booking page"
			class="flex size-9 cursor-pointer items-center justify-center border border-border text-foreground hover:bg-muted"
		>
			<Upload size={16} />
		</button>
		<button
			type="button"
			title="Account"
			class="flex size-9 cursor-pointer items-center justify-center border border-border text-foreground hover:bg-muted"
		>
			<User size={16} />
		</button>
	</div>
</header>
