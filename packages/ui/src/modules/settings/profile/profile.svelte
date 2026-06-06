<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import Pencil from '@tabler/icons-svelte/icons/pencil';
	import { createQuery } from '@tanstack/svelte-query';
	import { getUserProfileQueryOptions } from '../../api/user/get.user.profile.query';
	import { authStore } from '$stores/auth.svelte';
	import AboutTab from './tabs/about.svelte';
	import IntegrationsTab from './tabs/integrations.svelte';
	import ServicesTab from './tabs/services.svelte';
	import WorkingHoursTab from './tabs/working-hours.svelte';
	import BreaksTab from './tabs/breaks.svelte';
	import TimeOffTab from './tabs/timeoff.svelte';
	import UpdatesTab from './tabs/updates.svelte';

	const userQuery = createQuery(() => getUserProfileQueryOptions());

	function currentTime(): string {
		return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	let time = $state(currentTime());
</script>

<div class="flex flex-col">
	<!-- Profile header -->
	<div class="relative flex items-center gap-4 px-6 py-5">
		{#if userQuery.isLoading}
			<Skeleton class="size-16 rounded-full" />
			<div class="flex flex-col gap-1.5">
				<Skeleton class="h-4 w-32" />
				<Skeleton class="h-3 w-48" />
			</div>
		{:else if userQuery.data}
			{@const fullName = `${userQuery.data.name.firstName} ${userQuery.data.name.lastName}`}
			{@const initials = `${userQuery.data.name.firstName[0]}${userQuery.data.name.lastName[0]}`}
			<Avatar.Root class="size-16 text-lg">
				<Avatar.Image src={userQuery.data.avatarUrl ?? ''} alt={fullName} />
				<Avatar.Fallback class="bg-muted font-semibold text-foreground">
					{initials}
				</Avatar.Fallback>
			</Avatar.Root>
			<div class="flex flex-col gap-0.5">
				<span class="text-base font-semibold">{fullName}</span>
				<span class="text-xs text-muted-foreground">{time}</span>
			</div>
			<Button variant="ghost" size="icon-sm" class="absolute top-4 right-4">
				<Pencil size={16} />
			</Button>
		{/if}
	</div>

	<!-- Tabs -->
	<Tabs.Root value="about" class="flex flex-col">
		{#if authStore.getPayloadData()?.role !== 'Platform Owner'}
			<Tabs.List class="h-auto justify-start rounded-none border-b bg-transparent px-6 pb-0">
				<Tabs.Trigger
					value="about"
					class="cursor-pointer rounded-none border-b-2 border-transparent px-3 pt-0 pb-2 text-muted-foreground data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
				>
					About
				</Tabs.Trigger>
				<Tabs.Trigger
					value="integrations"
					class="cursor-pointer rounded-none border-b-2 border-transparent px-3 pt-0 pb-2 text-muted-foreground data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
				>
					Integrations
				</Tabs.Trigger>
				<Tabs.Trigger
					value="services"
					class="cursor-pointer rounded-none border-b-2 border-transparent px-3 pt-0 pb-2 text-muted-foreground data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
				>
					Services
				</Tabs.Trigger>
				<Tabs.Trigger
					value="working-hours"
					class="cursor-pointer rounded-none border-b-2 border-transparent px-3 pt-0 pb-2 text-muted-foreground data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
				>
					Working hours
				</Tabs.Trigger>
				<Tabs.Trigger
					value="breaks"
					class="cursor-pointer rounded-none border-b-2 border-transparent px-3 pt-0 pb-2 text-muted-foreground data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
				>
					Breaks
				</Tabs.Trigger>
				<Tabs.Trigger
					value="time-off"
					class="cursor-pointer rounded-none border-b-2 border-transparent px-3 pt-0 pb-2 text-muted-foreground data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
				>
					Time off
				</Tabs.Trigger>
				<Tabs.Trigger
					value="updates"
					class="cursor-pointer rounded-none border-b-2 border-transparent px-3 pt-0 pb-2 text-muted-foreground data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
				>
					Updates
				</Tabs.Trigger>
			</Tabs.List>
		{/if}

		<Tabs.Content value="about" class="mt-0">
			<AboutTab user={userQuery.data} isLoading={userQuery.isLoading} />
		</Tabs.Content>

		<Tabs.Content value="integrations" class="mt-0">
			<IntegrationsTab />
		</Tabs.Content>

		<Tabs.Content value="services" class="mt-0">
			<ServicesTab />
		</Tabs.Content>

		<Tabs.Content value="working-hours" class="mt-0">
			<WorkingHoursTab userWorkingHours={userQuery.data?.userWorkingHours} />
		</Tabs.Content>

		<Tabs.Content value="breaks" class="mt-0">
			<BreaksTab userWorkingHours={userQuery.data?.userWorkingHours} />
		</Tabs.Content>

		<Tabs.Content value="time-off" class="mt-0">
			<TimeOffTab />
		</Tabs.Content>

		<Tabs.Content value="updates" class="mt-0">
			<UpdatesTab />
		</Tabs.Content>
	</Tabs.Root>
</div>
