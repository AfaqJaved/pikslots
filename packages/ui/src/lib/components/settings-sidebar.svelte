<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { page } from '$app/stores';

	import BuildingStore from '@tabler/icons-svelte/icons/building-store';
	import User from '@tabler/icons-svelte/icons/user';
	import Users from '@tabler/icons-svelte/icons/users';
	import AdjustmentsHorizontal from '@tabler/icons-svelte/icons/adjustments-horizontal';
	import CalendarCog from '@tabler/icons-svelte/icons/calendar-cog';
	import Cash from '@tabler/icons-svelte/icons/cash';
	import ChartBar from '@tabler/icons-svelte/icons/chart-bar';
	import CreditCard from '@tabler/icons-svelte/icons/credit-card';
	import Bell from '@tabler/icons-svelte/icons/bell';
	import Star from '@tabler/icons-svelte/icons/star';
	import Lock from '@tabler/icons-svelte/icons/lock';
	import ChevronDown from '@tabler/icons-svelte/icons/chevron-down';
	import LayoutSidebarLeftCollapse from '@tabler/icons-svelte/icons/layout-sidebar-left-collapse';
	import { settingsStore } from '$stores/settings.svelte.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import * as m from '$lib/paraglide/messages.js';

	type SubItem = { label: () => string; href: string };

	type MenuItem = {
		key: string;
		label: () => string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		icon: any;
		href?: string;
		activePrefix?: string;
		children?: SubItem[];
	};

	type MenuGroup = {
		label?: () => string;
		items: MenuItem[];
	};

	const menuGroups: MenuGroup[] = [
		{
			items: [
				{
					key: 'brand',
					label: () => m.settings_your_brand(),
					icon: BuildingStore,
					activePrefix: '/home/settings/brand',
					children: [
						{ label: () => m.settings_brand_details(), href: '/home/settings/brand/brand-details' },
						{ label: () => m.settings_appearance(), href: '/home/settings/brand/appearance' },
						{ label: () => m.settings_contact_details(), href: '/home/settings/brand/contact' },
						{ label: () => m.settings_location(), href: '/home/settings/brand/location' },
						{ label: () => m.settings_business_hours(), href: '/home/settings/brand/business-hours' },
						{ label: () => m.settings_your_links(), href: '/home/settings/brand/links' }
					]
				},
				{ key: 'profile', label: () => m.settings_your_profile(), icon: User, href: '/home/settings/profile' },
				{ key: 'team', label: () => m.settings_your_team(), icon: Users, href: '/home/settings/team' },
				{ key: 'general', label: () => m.settings_general(), icon: AdjustmentsHorizontal, href: '/home/settings/general' }
			]
		},
		{
			label: () => m.settings_manage(),
			items: [
				{
					key: 'booking-preferences',
					label: () => m.settings_booking_preferences(),
					icon: CalendarCog,
					activePrefix: '/home/settings/booking-preferences',
					children: [
						{ label: () => m.settings_booking_policies(), href: '/home/settings/booking-preferences/booking-policies' },
						{ label: () => m.settings_booking_setup(), href: '/home/settings/booking-preferences/booking-setup' },
						{ label: () => m.settings_booking_customization(), href: '/home/settings/booking-preferences/customization' },
						{ label: () => m.settings_booking_page_visibility(), href: '/home/settings/booking-preferences/booking-page-visibility' }
					]
				},
				{
					key: 'payments',
					label: () => m.settings_payments(),
					icon: Cash,
					activePrefix: '/home/settings/payments',
					children: [
						{ label: () => m.settings_payment_integrations(), href: '/home/settings/payments/payment-integrations' },
						{ label: () => m.settings_booking_page_payments(), href: '/home/settings/payments/booking-page-payments' },
						{ label: () => m.settings_payments_history(), href: '/home/settings/payments/payments-history' }
					]
				},
				{ key: 'reports', label: () => m.settings_reports(), icon: ChartBar, href: '/home/settings/reports' },
				{ key: 'billing', label: () => m.settings_billing(), icon: CreditCard, href: '#' },
				{
					key: 'notifications',
					label: () => m.settings_notifications(),
					icon: Bell,
					activePrefix: '/home/settings/notifications',
					children: [
						{ label: () => m.settings_your_notifications(), href: '/home/settings/notifications/your-notifications' },
						{ label: () => m.settings_team_notifications(), href: '/home/settings/notifications/team-notifications' },
						{ label: () => m.settings_customer_notifications(), href: '/home/settings/notifications/customer-notifications' },
						{ label: () => m.settings_notifications_customization(), href: '/home/settings/notifications/customization' }
					]
				},
				{ key: 'reviews', label: () => m.settings_reviews(), icon: Star, href: '/home/settings/reviews' },
				{ key: 'security', label: () => m.settings_security(), icon: Lock, href: '/home/settings/security' }
			]
		}
	];

	let openState = $state<Record<string, boolean>>({
		'brand': $page.url.pathname.startsWith('/home/settings/brand'),
		'booking-preferences': $page.url.pathname.startsWith('/home/settings/booking-preferences'),
		'payments': $page.url.pathname.startsWith('/home/settings/payments'),
		'notifications': $page.url.pathname.startsWith('/home/settings/notifications')
	});

	$effect(() => {
		const path = $page.url.pathname;
		if (path.startsWith('/home/settings/brand')) openState['brand'] = true;
		if (path.startsWith('/home/settings/booking-preferences')) openState['booking-preferences'] = true;
		if (path.startsWith('/home/settings/payments')) openState['payments'] = true;
		if (path.startsWith('/home/settings/notifications')) openState['notifications'] = true;
	});

	function isItemActive(item: MenuItem): boolean {
		if (item.activePrefix) return $page.url.pathname.startsWith(item.activePrefix);
		if (item.href && item.href !== '#') return $page.url.pathname === item.href;
		return false;
	}
</script>

<aside
	class="flex h-svh w-64 shrink-0 flex-col border-r border-l bg-sidebar text-sidebar-foreground"
>
	<div class="flex shrink-0 items-center gap-2 border-b px-4 py-3" style="height: var(--header-height)">
		<button
			onclick={() => settingsStore.toggle()}
			class="-ms-1 inline-flex size-7 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
		>
			<LayoutSidebarLeftCollapse size={18} />
		</button>
		<span class="text-sm font-semibold">{m.settings_title()}</span>
	</div>

	<ScrollArea class="min-h-0 flex-1">
		<div class="flex flex-col gap-1 py-2">
			{#each menuGroups as group (group.label?.() ?? '__default')}
				<Sidebar.Group>
					{#if group.label}
						<Sidebar.GroupLabel>{group.label()}</Sidebar.GroupLabel>
					{/if}
					<Sidebar.Menu>
						{#each group.items as item (item.key)}
							<Sidebar.MenuItem>
								{#if item.children}
									<Sidebar.MenuButton
										isActive={isItemActive(item)}
										onclick={() => (openState[item.key] = !openState[item.key])}
									>
										<item.icon />
										<span>{item.label()}</span>
										<ChevronDown
											class="ml-auto transition-transform duration-200 {openState[item.key]
												? 'rotate-180'
												: ''}"
										/>
									</Sidebar.MenuButton>
									{#if openState[item.key]}
										<Sidebar.MenuSub>
											{#each item.children as sub (sub.href)}
												<Sidebar.MenuSubItem>
													<Sidebar.MenuSubButton isActive={$page.url.pathname === sub.href}>
														{#snippet child({ props })}
															<a href={sub.href} {...props}>{sub.label()}</a>
														{/snippet}
													</Sidebar.MenuSubButton>
												</Sidebar.MenuSubItem>
											{/each}
										</Sidebar.MenuSub>
									{/if}
								{:else}
									<Sidebar.MenuButton isActive={isItemActive(item)}>
										{#snippet child({ props })}
											<a href={item.href} {...props}>
												<item.icon /><span>{item.label()}</span>
											</a>
										{/snippet}
									</Sidebar.MenuButton>
								{/if}
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.Group>
			{/each}
		</div>
	</ScrollArea>
</aside>
