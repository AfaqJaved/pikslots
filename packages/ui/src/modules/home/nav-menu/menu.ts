import HelpIcon from '@tabler/icons-svelte/icons/help';
import SearchIcon from '@tabler/icons-svelte/icons/search';
import SettingsIcon from '@tabler/icons-svelte/icons/settings';
import Briefcase from '@tabler/icons-svelte/icons/briefcase';
import UserHeart from '@tabler/icons-svelte/icons/user-heart';
import Cash from '@tabler/icons-svelte/icons/cash';
import Puzzle from '@tabler/icons-svelte/icons/puzzle';
import { IconCalendarCheck } from '@tabler/icons-svelte';
import { settingsStore } from '$stores/settings.svelte.js';

export const navPrimary = [
	{ name: 'Bookings', url: '/home/bookings', icon: IconCalendarCheck },
	{ name: 'Services', url: '/home/services', icon: Briefcase },
	{ name: 'Customers', url: '/home/customers', icon: UserHeart },
	{ name: 'Payments', url: '/home/payments', icon: Cash },
	{ name: 'Integrations', url: '/home/integrations', icon: Puzzle }
];

export const navSecondary = [
	{
		title: 'Settings',
		url: '/home/settings/brand/brand-details',
		icon: SettingsIcon,
		onclick: () => settingsStore.toggle()
	},
	{ title: 'Get Help', url: '#', icon: HelpIcon },
	{ title: 'Search', url: '#', icon: SearchIcon }
];
