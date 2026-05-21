<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import Plus from '@tabler/icons-svelte/icons/plus';
	import Pencil from '@tabler/icons-svelte/icons/pencil';
	import Trash from '@tabler/icons-svelte/icons/trash';

	type TimeOff = { id: number; title: string; date: string; days: number };

	let timeoffs = $state<TimeOff[]>([{ id: 1, title: 'Eid holiday', date: '21 May 2026', days: 1 }]);

	let hoveredId = $state<number | null>(null);

	function remove(id: number) {
		timeoffs = timeoffs.filter((t) => t.id !== id);
	}
</script>

<div class="flex w-[60%] flex-col px-6">
	<!-- Add time off -->
	<div class="pt-4 pb-2">
		<Button variant="link" class="h-auto gap-1.5 p-0 text-sm font-medium">
			<Plus size={14} />
			Add time off
		</Button>
	</div>

	<!-- List -->
	<div class="flex flex-col divide-y divide-border/90">
		{#each timeoffs as entry (entry.id)}
			<div
				class="flex items-center justify-between py-3"
				onmouseenter={() => (hoveredId = entry.id)}
				onmouseleave={() => (hoveredId = null)}
			>
				<div class="flex flex-col gap-0.5">
					<span class="text-sm font-medium">{entry.title}</span>
					<span class="text-xs text-muted-foreground">{entry.date}</span>
				</div>

				<div class="flex items-center gap-2">
					{#if hoveredId === entry.id}
						<Button variant="ghost" size="icon-sm">
							<Pencil size={14} />
						</Button>
						<Button
							variant="ghost"
							size="icon-sm"
							onclick={() => remove(entry.id)}
							class="text-muted-foreground hover:text-destructive"
						>
							<Trash size={14} />
						</Button>
					{:else}
						<span class="text-sm text-muted-foreground">
							{entry.days}
							{entry.days === 1 ? 'Day' : 'Days'}
						</span>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>
