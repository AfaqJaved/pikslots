import HelpIcon from '@tabler/icons-svelte/icons/help';
import SearchIcon from '@tabler/icons-svelte/icons/search';
import SettingsIcon from '@tabler/icons-svelte/icons/settings';
import Briefcase from '@tabler/icons-svelte/icons/briefcase';
import UserHeart from '@tabler/icons-svelte/icons/user-heart';
import Cash from '@tabler/icons-svelte/icons/cash';
import Puzzle from '@tabler/icons-svelte/icons/puzzle';
import { IconCalendarCheck } from '@tabler/icons-svelte';
import type { Icon } from '@tabler/icons-svelte';
import { settingsStore } from '$stores/settings.svelte.js';
import { resolve } from '$app/paths';
import type { ResolvedPathname } from '$app/types';

export const navPrimary: { name: string; url: ResolvedPathname; icon: Icon }[] = [
	{ name: 'Bookings', url: resolve('/home/bookings'), icon: IconCalendarCheck },
	{ name: 'Services', url: resolve('/home/services'), icon: Briefcase },
	{ name: 'Customers', url: resolve('/home/customers'), icon: UserHeart },
	{ name: 'Payments', url: resolve('/home/payments'), icon: Cash },
	{ name: 'Integrations', url: resolve('/home/integrations'), icon: Puzzle }
];

export const navSecondary: {
	title: string;
	url: ResolvedPathname | '#';
	icon: Icon;
	onclick?: () => void;
}[] = [
	{
		title: 'Settings',
		url: resolve('/home/settings/brand/brand-details'),
		icon: SettingsIcon,
		onclick: () => settingsStore.toggle()
	},
	{ title: 'Get Help', url: '#', icon: HelpIcon },
	{ title: 'Search', url: '#', icon: SearchIcon }
];
