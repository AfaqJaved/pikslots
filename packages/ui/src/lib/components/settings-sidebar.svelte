<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { page } from '$app/stores';

	import BuildingStore from '@tabler/icons-svelte/icons/building-store';
	import User from '@tabler/icons-svelte/icons/user';
	import Users from '@tabler/icons-svelte/icons/users';
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

	const notificationsItems = [
		{ label: 'Your notifications', href: '/home/settings/notifications/your-notifications' },
		{ label: 'Team notifications', href: '/home/settings/notifications/team-notifications' },
		{
			label: 'Customer notifications',
			href: '/home/settings/notifications/customer-notifications'
		},
		{ label: 'Customization', href: '/home/settings/notifications/customization' }
	];

	const paymentsItems = [
		{ label: 'Payment integrations', href: '/home/settings/payments/payment-integrations' },
		{ label: 'Booking Page payments', href: '/home/settings/payments/booking-page-payments' },
		{ label: 'Payments history', href: '/home/settings/payments/payments-history' }
	];

	const bookingPrefsItems = [
		{ label: 'Booking policies', href: '/home/settings/booking-preferences/booking-policies' },
		{ label: 'Booking setup', href: '/home/settings/booking-preferences/booking-setup' },
		{ label: 'Customization', href: '/home/settings/booking-preferences/customization' },
		{
			label: 'Booking page visibility',
			href: '/home/settings/booking-preferences/booking-page-visibility'
		}
	];

	const brandItems = [
		{ label: 'Brand details', href: '/home/settings/brand/brand-details' },
		{ label: 'Appearance', href: '/home/settings/brand/appearance' },
		{ label: 'Contact details', href: '/home/settings/brand/contact' },
		{ label: 'Location', href: '/home/settings/brand/location' },
		{ label: 'Business Hours', href: '/home/settings/brand/business-hours' },
		{ label: 'Your links', href: '/home/settings/brand/links' }
	];

	function isActive(href: string): boolean {
		return $page.url.pathname === href;
	}

	function isSubActive(href: string): boolean {
		return $page.url.pathname === href;
	}

	let brandOpen = $state($page.url.pathname.startsWith('/home/settings/brand'));
	let availabilityOpen = $state($page.url.pathname.startsWith('/home/settings/availability'));
	let bookingPrefsOpen = $state(false);
	let paymentsOpen = $state(false);
	let notificationsOpen = $state(false);

	$effect(() => {
		if ($page.url.pathname.startsWith('/home/settings/brand')) brandOpen = true;
		if ($page.url.pathname.startsWith('/home/settings/availability')) availabilityOpen = true;
	});
</script>

<aside
	class="flex h-svh w-64 shrink-0 flex-col overflow-y-auto border-r border-l bg-sidebar text-sidebar-foreground"
>
	<div class="flex items-center border-b px-4 py-3" style="height: var(--header-height)">
		<span class="text-sm font-semibold">Settings</span>
	</div>

	<div class="flex flex-col gap-1 py-2">
		<!-- Brand section -->
		<Sidebar.Group>
			<Sidebar.Menu>
				<!-- Your brand (collapsible) -->
				<Sidebar.MenuItem>
					<Sidebar.MenuButton
						isActive={$page.url.pathname.startsWith('/home/settings/brand')}
						onclick={() => (brandOpen = !brandOpen)}
					>
						<BuildingStore />
						<span>Your brand</span>
						<ChevronDown
							class="ml-auto transition-transform duration-200 {brandOpen ? 'rotate-180' : ''}"
						/>
					</Sidebar.MenuButton>
					{#if brandOpen}
						<Sidebar.MenuSub>
							{#each brandItems as item (item.href)}
								<Sidebar.MenuSubItem>
									<Sidebar.MenuSubButton isActive={isSubActive(item.href)}>
										{#snippet child({ props })}
											<a href={item.href} {...props}>{item.label}</a>
										{/snippet}
									</Sidebar.MenuSubButton>
								</Sidebar.MenuSubItem>
							{/each}
						</Sidebar.MenuSub>
					{/if}
				</Sidebar.MenuItem>

				<!-- Your profile -->
				<Sidebar.MenuItem>
					<Sidebar.MenuButton isActive={isActive('/home/settings/profile')}>
						{#snippet child({ props })}
							<a href="/home/settings/profile" {...props}>
								<User /><span>Your profile</span>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>

				<!-- Your team -->
				<Sidebar.MenuItem>
					<Sidebar.MenuButton isActive={isActive('/home/settings/team')}>
						{#snippet child({ props })}
							<a href="/home/settings/team" {...props}>
								<Users /><span>Your team</span>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>

				<!-- General -->
				<Sidebar.MenuItem>
					<Sidebar.MenuButton isActive={isActive('/home/settings/general')}>
						{#snippet child({ props })}
							<a href="/home/settings/general" {...props}>
								<AdjustmentsHorizontal /><span>General</span>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Group>

		<!-- Manage section -->
		<Sidebar.Group>
			<Sidebar.GroupLabel>Manage</Sidebar.GroupLabel>
			<Sidebar.Menu>
				<!-- Booking preferences (collapsible) -->
				<Sidebar.MenuItem>
					<Sidebar.MenuButton onclick={() => (bookingPrefsOpen = !bookingPrefsOpen)}>
						<CalendarCog />
						<span>Booking preferences</span>
						<ChevronDown
							class="ml-auto transition-transform duration-200 {bookingPrefsOpen
								? 'rotate-180'
								: ''}"
						/>
					</Sidebar.MenuButton>
					{#if bookingPrefsOpen}
						<Sidebar.MenuSub>
							{#each bookingPrefsItems as item (item.href)}
								<Sidebar.MenuSubItem>
									<Sidebar.MenuSubButton isActive={isSubActive(item.href)}>
										{#snippet child({ props })}
											<a href={item.href} {...props}>{item.label}</a>
										{/snippet}
									</Sidebar.MenuSubButton>
								</Sidebar.MenuSubItem>
							{/each}
						</Sidebar.MenuSub>
					{/if}
				</Sidebar.MenuItem>

				<Sidebar.MenuItem>
					<Sidebar.MenuButton>
						{#snippet child({ props })}
							<a href="#" {...props}><DeviceMobile /><span>Your branded app</span></a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>

				<!-- Payments (collapsible) -->
				<Sidebar.MenuItem>
					<Sidebar.MenuButton onclick={() => (paymentsOpen = !paymentsOpen)}>
						<Cash />
						<span>Payments</span>
						<ChevronDown
							class="ml-auto transition-transform duration-200 {paymentsOpen ? 'rotate-180' : ''}"
						/>
					</Sidebar.MenuButton>
					{#if paymentsOpen}
						<Sidebar.MenuSub>
							{#each paymentsItems as item (item.href)}
								<Sidebar.MenuSubItem>
									<Sidebar.MenuSubButton isActive={isSubActive(item.href)}>
										{#snippet child({ props })}
											<a href={item.href} {...props}>{item.label}</a>
										{/snippet}
									</Sidebar.MenuSubButton>
								</Sidebar.MenuSubItem>
							{/each}
						</Sidebar.MenuSub>
					{/if}
				</Sidebar.MenuItem>

				<Sidebar.MenuItem>
					<Sidebar.MenuButton>
						{#snippet child({ props })}
							<a href="/home/settings/reports" {...props}><ChartBar /><span>Reports</span></a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>

				<Sidebar.MenuItem>
					<Sidebar.MenuButton>
						{#snippet child({ props })}
							<a href="#" {...props}><CreditCard /><span>Billing</span></a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>

				<!-- Notifications (collapsible) -->
				<Sidebar.MenuItem>
					<Sidebar.MenuButton onclick={() => (notificationsOpen = !notificationsOpen)}>
						<Bell />
						<span>Notifications</span>
						<ChevronDown
							class="ml-auto transition-transform duration-200 {notificationsOpen
								? 'rotate-180'
								: ''}"
						/>
					</Sidebar.MenuButton>
					{#if notificationsOpen}
						<Sidebar.MenuSub>
							{#each notificationsItems as item (item.href)}
								<Sidebar.MenuSubItem>
									<Sidebar.MenuSubButton isActive={isSubActive(item.href)}>
										{#snippet child({ props })}
											<a href={item.href} {...props}>{item.label}</a>
										{/snippet}
									</Sidebar.MenuSubButton>
								</Sidebar.MenuSubItem>
							{/each}
						</Sidebar.MenuSub>
					{/if}
				</Sidebar.MenuItem>

				<Sidebar.MenuItem>
					<Sidebar.MenuButton>
						{#snippet child({ props })}
							<a href="/home/settings/reviews" {...props}><Star /><span>Reviews</span></a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>

				<Sidebar.MenuItem>
					<Sidebar.MenuButton>
						{#snippet child({ props })}
							<a href="/home/settings/security" {...props}><Lock /><span>Security</span></a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Group>
	</div>
</aside>
