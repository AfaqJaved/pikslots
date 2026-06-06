<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import Phone from '@tabler/icons-svelte/icons/phone';
	import Mail from '@tabler/icons-svelte/icons/mail';
	import Clock from '@tabler/icons-svelte/icons/clock';
	import Qrcode from '@tabler/icons-svelte/icons/qrcode';
	import Lock from '@tabler/icons-svelte/icons/lock';
	import ChevronDown from '@tabler/icons-svelte/icons/chevron-down';
	import Pencil from '@tabler/icons-svelte/icons/pencil';
	import type { UserSummary } from '@pikslots/shared';

	let { user, isLoading }: { user: UserSummary | undefined; isLoading: boolean } = $props();
</script>

<div class="flex flex-col px-6">
	{#if isLoading}
		<div class="flex flex-col gap-3 pt-4">
			{#each Array(4) as _}
				<Skeleton class="h-4 w-56" />
			{/each}
		</div>
	{:else if user}
		<!-- Phone -->
		<div class="flex items-center gap-3 pt-4 pb-2">
			<Phone size={16} class="shrink-0 text-muted-foreground" />
			<span class="text-xs">{user.phone ?? '—'}</span>
		</div>

		<!-- Email -->
		<div class="flex items-center gap-3 py-2">
			<Mail size={16} class="shrink-0 text-muted-foreground" />
			<span class="text-xs">{user.email}</span>
		</div>

		<!-- Hours today -->
		<div class="flex items-center gap-3 py-2">
			<Clock size={16} class="shrink-0 text-muted-foreground" />
			<span class="text-xs"> Today &bull; Closed </span>
			<div class="ml-1 flex items-center gap-1">
				<Button variant="ghost" size="icon-sm" class="size-6">
					<ChevronDown size={14} />
				</Button>
				<Button variant="ghost" size="icon-sm" class="size-6">
					<Pencil size={13} />
				</Button>
			</div>
		</div>

		<!-- Booking URL -->
		<div class="flex items-center gap-3 py-2">
			<Qrcode size={16} class="shrink-0 text-muted-foreground" />
			<a
				href={user.bookingUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="text-xs underline underline-offset-2"
			>
				{user.bookingUrl}
			</a>
			<Button variant="ghost" size="icon-sm" class="size-6">
				<Pencil size={13} />
			</Button>
		</div>

		<!-- Role -->
		<div class="flex items-center gap-3 py-2">
			<Lock size={16} class="shrink-0 text-muted-foreground" />
			<button
				type="button"
				disabled
				class="flex cursor-not-allowed items-center gap-1 text-xs text-muted-foreground"
			>
				{user.role}
				<ChevronDown size={14} />
			</button>
		</div>
	{/if}
</div>
