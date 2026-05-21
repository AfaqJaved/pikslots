<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Pencil from '@tabler/icons-svelte/icons/pencil';
	import Phone from '@tabler/icons-svelte/icons/phone';
	import Mail from '@tabler/icons-svelte/icons/mail';
	import Clock from '@tabler/icons-svelte/icons/clock';
	import Qrcode from '@tabler/icons-svelte/icons/qrcode';
	import Lock from '@tabler/icons-svelte/icons/lock';
	import ChevronDown from '@tabler/icons-svelte/icons/chevron-down';
	import Plus from '@tabler/icons-svelte/icons/plus';
	import Search from '@tabler/icons-svelte/icons/search';

	const members = [
		{
			id: 1,
			name: 'Afaq Javed',
			initials: 'A',
			isYou: true,
			location: 'Karachi, SD, PK',
			phone: '0332 2615528',
			email: 'afaqjavedofficial@gmail.com',
			hoursToday: '9:00 AM - 5:00 PM',
			timezone: 'PKT',
			bookingUrl: 'https://pikslots.com/afaq',
			role: 'Owner'
		}
	];

	let search = $state('');
	let selectedId = $state(members[0].id);

	const selected = $derived(members.find((m) => m.id === selectedId) ?? members[0]);

	const filtered = $derived(
		members.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
	);

	function currentTime(): string {
		return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	let time = $state(currentTime());
</script>

<div class="flex h-full min-h-0 flex-1">
	<!-- Left: team list -->
	<div class="flex w-64 shrink-0 flex-col border-r">
		<div class="flex items-center justify-between border-b px-4 py-3">
			<span class="text-base font-semibold">Your team</span>
			<Button size="icon-sm" class="rounded-full">
				<Plus size={16} />
			</Button>
		</div>

		<!-- Search -->
		<div class="px-3 py-2">
			<div class="relative">
				<Search
					size={14}
					class="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
				/>
				<Input bind:value={search} placeholder="Search" class="pl-8 text-sm" />
			</div>
		</div>

		<!-- Members -->
		<div class="flex flex-col">
			{#each filtered as member (member.id)}
				<button
					type="button"
					onclick={() => (selectedId = member.id)}
					class="flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent
						{selectedId === member.id ? 'bg-accent' : ''}"
				>
					<div class="relative">
						<Avatar.Root class="size-8 text-sm">
							<Avatar.Fallback class="bg-muted font-medium text-foreground">
								{member.initials}
							</Avatar.Fallback>
						</Avatar.Root>
						<span
							class="absolute right-0 bottom-0 size-2 rounded-full bg-green-500 ring-1 ring-background"
						></span>
					</div>
					<span class="flex-1 truncate text-sm font-medium">{member.name}</span>
					{#if member.isYou}
						<Badge variant="secondary" class="text-xs">You</Badge>
					{/if}
				</button>
			{/each}
		</div>
	</div>

	<!-- Right: member about -->
	<div class="flex flex-1 flex-col">
		<!-- Member header -->
		<div class="flex items-start justify-between px-6 py-5">
			<div class="flex items-center gap-4">
				<Avatar.Root class="size-14 text-lg">
					<Avatar.Fallback class="bg-muted font-semibold text-foreground">
						{selected.initials}
					</Avatar.Fallback>
				</Avatar.Root>
				<div class="flex flex-col gap-0.5">
					<span class="text-base font-semibold">{selected.name}</span>
					<span class="text-sm text-muted-foreground">{selected.location} · {time}</span>
				</div>
			</div>
			<Button variant="ghost" size="icon-sm">
				<Pencil size={16} />
			</Button>
		</div>

		<!-- About rows -->
		<div class="flex flex-col border-t px-6">
			<div class="flex items-center gap-3 pt-4 pb-2">
				<Phone size={16} class="shrink-0 text-muted-foreground" />
				<span class="text-sm">{selected.phone}</span>
			</div>

			<div class="flex items-center gap-3 py-2">
				<Mail size={16} class="shrink-0 text-muted-foreground" />
				<span class="text-sm">{selected.email}</span>
			</div>

			<div class="flex items-center gap-3 py-2">
				<Clock size={16} class="shrink-0 text-muted-foreground" />
				<span class="text-sm">
					Today &bull; {selected.hoursToday}
					<span class="text-muted-foreground">({selected.timezone})</span>
				</span>
				<div class="ml-1 flex items-center gap-1">
					<Button variant="ghost" size="icon-sm" class="size-6">
						<ChevronDown size={14} />
					</Button>
					<Button variant="ghost" size="icon-sm" class="size-6">
						<Pencil size={13} />
					</Button>
				</div>
			</div>

			<div class="flex items-center gap-3 py-2">
				<Qrcode size={16} class="shrink-0 text-muted-foreground" />
				<a
					href={selected.bookingUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="text-sm underline underline-offset-2"
				>
					{selected.bookingUrl}
				</a>
				<Button variant="ghost" size="icon-sm" class="size-6">
					<Pencil size={13} />
				</Button>
			</div>

			<div class="flex items-center gap-3 py-2">
				<Lock size={16} class="shrink-0 text-muted-foreground" />
				<button
					type="button"
					disabled
					class="flex cursor-not-allowed items-center gap-1 text-sm text-muted-foreground"
				>
					{selected.role}
					<ChevronDown size={14} />
				</button>
			</div>
		</div>
	</div>
</div>
