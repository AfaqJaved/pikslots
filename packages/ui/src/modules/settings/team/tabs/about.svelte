<script lang="ts">
	import Phone from '@tabler/icons-svelte/icons/phone';
	import Mail from '@tabler/icons-svelte/icons/mail';
	import Qrcode from '@tabler/icons-svelte/icons/qrcode';
	import Lock from '@tabler/icons-svelte/icons/lock';
	import type { UserSummary } from '@pikslots/shared';

	let { user }: { user: UserSummary } = $props();
</script>

<div class="flex flex-col px-6">
	<div class="flex items-center gap-3 pt-4 pb-2">
		<Mail size={16} class="shrink-0 text-muted-foreground" />
		<span class="text-xs">{user.email}</span>
	</div>

	{#if user.phone}
		<div class="flex items-center gap-3 py-2">
			<Phone size={16} class="shrink-0 text-muted-foreground" />
			<span class="text-xs">{user.phone}</span>
		</div>
	{/if}

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
	</div>

	<div class="flex items-center gap-3 py-2">
		<Lock size={16} class="shrink-0 text-muted-foreground" />
		<span class="text-xs text-muted-foreground">{user.role}</span>
	</div>

	<div class="flex items-center gap-3 py-2">
		<span
			class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
			{user.status === 'active'
				? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
				: user.status === 'invited'
					? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
					: user.status === 'suspended'
						? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
						: 'bg-muted text-muted-foreground'}"
		>
			{user.status}
		</span>
	</div>
</div>
