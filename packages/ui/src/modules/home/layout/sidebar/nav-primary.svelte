<script lang="ts">
	import type { Icon } from '@tabler/icons-svelte';

	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { page } from '$app/stores';
	import { settingsStore } from '$stores/settings.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { items }: { items: { name: () => string; url: string; icon: Icon }[] } = $props();

	function isActive(url: string): boolean {
		return $page.url.pathname === url || $page.url.pathname.startsWith(url + '/');
	}
</script>

<Sidebar.Group class="group-data-[collapsible=icon]:hidden">
	<Sidebar.GroupLabel>{m.nav_manage()}</Sidebar.GroupLabel>
	<Sidebar.Menu>
		{#each items as item (item.url)}
			<Sidebar.MenuItem>
				<Sidebar.MenuButton isActive={isActive(item.url)}>
					{#snippet child({ props })}
						<div onclick={() => settingsStore.close()}>
							<a {...props} href={item.url}>
								<item.icon />
								<span>{item.name()}</span>
							</a>
						</div>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		{/each}
	</Sidebar.Menu>
</Sidebar.Group>
