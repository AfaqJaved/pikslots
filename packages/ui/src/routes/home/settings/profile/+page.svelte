<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Pencil from '@tabler/icons-svelte/icons/pencil';
	import Phone from '@tabler/icons-svelte/icons/phone';
	import Mail from '@tabler/icons-svelte/icons/mail';
	import Clock from '@tabler/icons-svelte/icons/clock';
	import Qrcode from '@tabler/icons-svelte/icons/qrcode';
	import Lock from '@tabler/icons-svelte/icons/lock';
	import ChevronDown from '@tabler/icons-svelte/icons/chevron-down';

	// Mock data — replace with real user data
	const user = {
		name: 'Afaq Javed',
		initials: 'A',
		location: 'Karachi, SD, PK',
		phone: '0332 2615528',
		email: 'afaqjavedofficial@gmail.com',
		hoursToday: '9:00 AM - 5:00 PM',
		timezone: 'PKT',
		bookingUrl: 'https://pikslots.com/afaq',
		role: 'Owner'
	};

	function currentTime(): string {
		return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	let time = $state(currentTime());
</script>

<div class="flex flex-col">
	<!-- Profile header -->
	<div class="flex items-start justify-between border-b px-6 py-5">
		<div class="flex items-center gap-4">
			<Avatar.Root class="size-14 text-lg">
				<Avatar.Fallback class="bg-muted font-semibold text-foreground">
					{user.initials}
				</Avatar.Fallback>
			</Avatar.Root>
			<div class="flex flex-col gap-0.5">
				<span class="text-base font-semibold">{user.name}</span>
				<span class="text-sm text-muted-foreground">{user.location} · {time}</span>
			</div>
		</div>
		<Button variant="ghost" size="icon-sm">
			<Pencil size={16} />
		</Button>
	</div>

	<!-- About content -->
	<div class="flex flex-col px-6">
		<!-- Phone -->
		<div class="flex items-center gap-3 pt-4 pb-2">
			<Phone size={16} class="shrink-0 text-muted-foreground" />
			<span class="text-sm">{user.phone}</span>
		</div>

		<!-- Email -->
		<div class="flex items-center gap-3 py-2">
			<Mail size={16} class="shrink-0 text-muted-foreground" />
			<span class="text-sm">{user.email}</span>
		</div>

		<!-- Hours today -->
		<div class="flex items-center gap-3 py-2">
			<Clock size={16} class="shrink-0 text-muted-foreground" />
			<span class="text-sm">
				Today &bull; {user.hoursToday}
				<span class="text-muted-foreground">({user.timezone})</span>
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

		<!-- Booking URL -->
		<div class="flex items-center gap-3 py-2">
			<Qrcode size={16} class="shrink-0 text-muted-foreground" />
			<a
				href={user.bookingUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="text-sm underline underline-offset-2"
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
				class="flex cursor-not-allowed items-center gap-1 text-sm text-muted-foreground"
			>
				{user.role}
				<ChevronDown size={14} />
			</button>
		</div>
	</div>
</div>
