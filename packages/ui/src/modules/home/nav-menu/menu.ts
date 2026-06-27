import HelpIcon from '@tabler/icons-svelte/icons/help';
import SearchIcon from '@tabler/icons-svelte/icons/search';
import SettingsIcon from '@tabler/icons-svelte/icons/settings';
import Briefcase from '@tabler/icons-svelte/icons/briefcase';
import UserHeart from '@tabler/icons-svelte/icons/user-heart';
import Cash from '@tabler/icons-svelte/icons/cash';
import Puzzle from '@tabler/icons-svelte/icons/puzzle';
import { IconCalendarCheck } from '@tabler/icons-svelte';
import { settingsStore } from '$stores/settings.svelte.js';
import * as m from '$lib/paraglide/messages.js';

export const navPrimary = [
	{ name: () => m.nav_bookings(), url: '/home/bookings', icon: IconCalendarCheck },
	{ name: () => m.nav_services(), url: '/home/services', icon: Briefcase },
	{ name: () => m.nav_customers(), url: '/home/customers', icon: UserHeart },
	{ name: () => m.nav_payments(), url: '/home/payments', icon: Cash },
	{ name: () => m.nav_integrations(), url: '/home/integrations', icon: Puzzle }
];

export const navSecondary = [
	{
		key: 'settings',
		title: () => m.nav_settings(),
		url: '/home/settings/brand/brand-details',
		icon: SettingsIcon,
		onclick: () => settingsStore.toggle()
	},
	{ key: 'help', title: () => m.nav_get_help(), url: '#', icon: HelpIcon },
	{ key: 'search', title: () => m.nav_search(), url: '#', icon: SearchIcon }
];
