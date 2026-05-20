<script lang="ts">
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { settingsStore } from '$lib/stores/settings.svelte.js';

	import BuildingStore from '@tabler/icons-svelte/icons/building-store';
	import User from '@tabler/icons-svelte/icons/user';
	import Users from '@tabler/icons-svelte/icons/users';
	import Briefcase from '@tabler/icons-svelte/icons/briefcase';
	import AdjustmentsHorizontal from '@tabler/icons-svelte/icons/adjustments-horizontal';
	import CalendarCog from '@tabler/icons-svelte/icons/calendar-cog';
	import DeviceMobile from '@tabler/icons-svelte/icons/device-mobile';
	import Cash from '@tabler/icons-svelte/icons/cash';
	import ChartBar from '@tabler/icons-svelte/icons/chart-bar';
	import CreditCard from '@tabler/icons-svelte/icons/credit-card';
	import Bell from '@tabler/icons-svelte/icons/bell';
	import Star from '@tabler/icons-svelte/icons/star';
	import Lock from '@tabler/icons-svelte/icons/lock';
	import ChevronDown from '@tabler/icons-svelte/icons/chevron-down';
	import ChevronUp from '@tabler/icons-svelte/icons/chevron-up';

	let brandOpen = $state(true);
	let bookingPrefsOpen = $state(false);
	let paymentsOpen = $state(false);
	let notificationsOpen = $state(false);
</script>

<aside
	class="bg-sidebar text-sidebar-foreground flex h-svh w-64 shrink-0 flex-col overflow-y-auto border-r"
>
	<div class="flex items-center justify-between border-b px-5 py-4">
		<h2 class="text-base font-semibold">Settings</h2>
	</div>

	<nav class="flex flex-col gap-0.5 px-3 py-3">
		<!-- Your brand (collapsible) -->
		<button
			onclick={() => (brandOpen = !brandOpen)}
			class="hover:bg-sidebar-accent flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-medium transition-colors"
		>
			<span class="flex items-center gap-2">
				<BuildingStore size={16} />
				Your brand
			</span>
			{#if brandOpen}
				<ChevronUp size={14} class="text-sidebar-foreground/50" />
			{:else}
				<ChevronDown size={14} class="text-sidebar-foreground/50" />
			{/if}
		</button>
		{#if brandOpen}
			<div class="ml-4 flex flex-col border-l pl-3">
				{#each ['Brand details', 'Appearance', 'Contact details', 'Location', 'Business hours', 'Your links'] as label}
					<a
						href="#"
						class="hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground rounded-md px-2 py-1.5 text-sm transition-colors"
					>
						{label}
					</a>
				{/each}
			</div>
		{/if}

		{#each [{ icon: User, label: 'Your profile' }, { icon: Users, label: 'Your team' }, { icon: Briefcase, label: 'Services' }, { icon: AdjustmentsHorizontal, label: 'General' }] as item}
			<a
				href="#"
				class="hover:bg-sidebar-accent flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors"
			>
				<item.icon size={16} />
				{item.label}
			</a>
		{/each}

		<Separator class="my-2" />
		<p class="text-sidebar-foreground/50 px-2 py-1 text-xs font-semibold tracking-wider uppercase">
			Manage
		</p>

		<!-- Booking preferences (collapsible) -->
		<button
			onclick={() => (bookingPrefsOpen = !bookingPrefsOpen)}
			class="hover:bg-sidebar-accent flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-medium transition-colors"
		>
			<span class="flex items-center gap-2">
				<CalendarCog size={16} />
				Booking preferences
			</span>
			{#if bookingPrefsOpen}
				<ChevronUp size={14} class="text-sidebar-foreground/50" />
			{:else}
				<ChevronDown size={14} class="text-sidebar-foreground/50" />
			{/if}
		</button>
		{#if bookingPrefsOpen}
			<div class="ml-4 flex flex-col border-l pl-3">
				{#each ['Booking rules', 'Availability', 'Reminders'] as label}
					<a
						href="#"
						class="hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground rounded-md px-2 py-1.5 text-sm transition-colors"
					>
						{label}
					</a>
				{/each}
			</div>
		{/if}

		<a
			href="#"
			class="hover:bg-sidebar-accent flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors"
		>
			<DeviceMobile size={16} />
			Your branded app
		</a>

		<!-- Payments (collapsible) -->
		<button
			onclick={() => (paymentsOpen = !paymentsOpen)}
			class="hover:bg-sidebar-accent flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-medium transition-colors"
		>
			<span class="flex items-center gap-2">
				<Cash size={16} />
				Payments
			</span>
			{#if paymentsOpen}
				<ChevronUp size={14} class="text-sidebar-foreground/50" />
			{:else}
				<ChevronDown size={14} class="text-sidebar-foreground/50" />
			{/if}
		</button>
		{#if paymentsOpen}
			<div class="ml-4 flex flex-col border-l pl-3">
				{#each ['Payment methods', 'Payouts', 'Tax settings'] as label}
					<a
						href="#"
						class="hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground rounded-md px-2 py-1.5 text-sm transition-colors"
					>
						{label}
					</a>
				{/each}
			</div>
		{/if}

		{#each [{ icon: ChartBar, label: 'Reports' }, { icon: CreditCard, label: 'Billing' }] as item}
			<a
				href="#"
				class="hover:bg-sidebar-accent flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors"
			>
				<item.icon size={16} />
				{item.label}
			</a>
		{/each}

		<!-- Notifications (collapsible) -->
		<button
			onclick={() => (notificationsOpen = !notificationsOpen)}
			class="hover:bg-sidebar-accent flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-medium transition-colors"
		>
			<span class="flex items-center gap-2">
				<Bell size={16} />
				Notifications
			</span>
			{#if notificationsOpen}
				<ChevronUp size={14} class="text-sidebar-foreground/50" />
			{:else}
				<ChevronDown size={14} class="text-sidebar-foreground/50" />
			{/if}
		</button>
		{#if notificationsOpen}
			<div class="ml-4 flex flex-col border-l pl-3">
				{#each ['Email', 'SMS', 'Push'] as label}
					<a
						href="#"
						class="hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground rounded-md px-2 py-1.5 text-sm transition-colors"
					>
						{label}
					</a>
				{/each}
			</div>
		{/if}

		{#each [{ icon: Star, label: 'Reviews' }, { icon: Lock, label: 'Security' }] as item}
			<a
				href="#"
				class="hover:bg-sidebar-accent flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors"
			>
				<item.icon size={16} />
				{item.label}
			</a>
		{/each}
	</nav>
</aside>
