<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import type { TimeUnit } from '@pikslots/shared';
	import { businessStore } from '../../../core/store/business.svelte';

	const business = $derived(businessStore.selectedBusiness);

	// ── Updates ────────────────────────────────────────────────────
	let confirmations = $state(true);
	let changes = $state(true);
	let cancellations = $state(true);

	// ── Reminders ──────────────────────────────────────────────────
	let reminder1 = $state(true);
	let reminder1Value = $state('1');
	let reminder1Unit = $state<TimeUnit>('days');

	let reminder2 = $state(false);
	let reminder2Value = $state('12');
	let reminder2Unit = $state<TimeUnit>('hours');

	const reminderUnits: { value: TimeUnit; label: string }[] = [
		{ value: 'minutes', label: 'Minutes' },
		{ value: 'hours', label: 'Hours' },
		{ value: 'days', label: 'Days' },
		{ value: 'weeks', label: 'Weeks' }
	];

	$effect(() => {
		if (business) {
			const n = business.customerNotifications;
			confirmations = n.notifyBookingConfirmation;
			changes = n.notifyBookingChanges;
			cancellations = n.notifyBookingCancellations;
			reminder1Value = String(n.bookingRemindersTime.value);
			reminder1Unit = n.bookingRemindersTime.unit;
			reminder1 = n.bookingRemindersTime.value > 0;
		}
	});
</script>

<div class="flex flex-col">
	<!-- Page header -->
	<div class="flex items-center justify-between border-b px-6 py-4">
		<h1 class="text-base font-semibold">Notifications</h1>
		<div class="flex items-center gap-2">
			<Button variant="outline">Cancel</Button>
			<Button>Save</Button>
		</div>
	</div>

	<div class="flex w-[60%] flex-col gap-6 px-6 py-4">
		<!-- Customer notifications -->
		<div class="flex flex-col gap-0.5">
			<h2 class="text-sm font-semibold">Customer notifications</h2>
			<span class="text-xs text-muted-foreground"
				>Select the real-time updates your customers will receive.</span
			>
		</div>

		<!-- Updates -->
		<div class="flex flex-col gap-3">
			<div class="flex flex-col gap-0.5">
				<span class="text-xs font-medium">Updates</span>
				<span class="text-xs text-muted-foreground"
					>Automate notifications for new, edited and cancelled bookings</span
				>
			</div>

			<div class="flex flex-col gap-3">
				<div class="flex items-start gap-3">
					<Checkbox bind:checked={confirmations} class="mt-0.5" />
					<div class="flex flex-col gap-0.5">
						<span class="text-xs font-medium">Confirmations</span>
						<span class="text-xs text-muted-foreground"
							>Automate notifications for new bookings</span
						>
					</div>
				</div>

				<div class="flex items-start gap-3">
					<Checkbox bind:checked={changes} class="mt-0.5" />
					<div class="flex flex-col gap-0.5">
						<span class="text-xs font-medium">Changes</span>
						<span class="text-xs text-muted-foreground"
							>Automate notifications for edited or rescheduled bookings</span
						>
					</div>
				</div>

				<div class="flex items-start gap-3">
					<Checkbox bind:checked={cancellations} class="mt-0.5" />
					<div class="flex flex-col gap-0.5">
						<span class="text-xs font-medium">Cancellations</span>
						<span class="text-xs text-muted-foreground"
							>Automate notifications for cancelled bookings</span
						>
					</div>
				</div>
			</div>
		</div>

		<!-- Reminders -->
		<div class="flex flex-col gap-3">
			<div class="flex flex-col gap-0.5">
				<span class="text-xs font-medium">Reminders</span>
				<span class="text-xs text-muted-foreground"
					>Reduce no-shows and rescheduling with automatic booking reminders.</span
				>
			</div>

			<div class="flex flex-col gap-0.5">
				<span class="text-xs font-medium">Email</span>
				<span class="text-xs text-muted-foreground">Prior to each appointment</span>
			</div>

			<!-- Reminder 1 -->
			<div class="flex items-center justify-between gap-6">
				<div class="flex items-center gap-3">
					<Checkbox bind:checked={reminder1} />
					<span class="text-xs font-medium">Reminder 1</span>
				</div>
				<div class="flex shrink-0 items-center gap-2">
					<Input
						type="number"
						bind:value={reminder1Value}
						disabled={!reminder1}
						class="w-16 text-xs"
						min="1"
					/>
					<Select.Root type="single" bind:value={reminder1Unit} disabled={!reminder1}>
						<Select.Trigger class="w-28 text-xs">
							{reminderUnits.find((u) => u.value === reminder1Unit)?.label ?? reminder1Unit}
						</Select.Trigger>
						<Select.Content>
							{#each reminderUnits as u (u.value)}
								<Select.Item value={u.value}>{u.label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>

			<!-- Reminder 2 (pro) -->
			<div class="flex items-center justify-between gap-6 opacity-50">
				<div class="flex items-center gap-3">
					<Checkbox bind:checked={reminder2} disabled />
					<span class="text-xs text-muted-foreground">Reminder 2</span>
				</div>
				<div class="flex shrink-0 items-center gap-2">
					<Input type="number" bind:value={reminder2Value} disabled class="w-16 text-xs" />
					<Select.Root type="single" bind:value={reminder2Unit} disabled>
						<Select.Trigger class="w-28 text-xs">
							{reminderUnits.find((u) => u.value === reminder2Unit)?.label ?? reminder2Unit}
						</Select.Trigger>
						<Select.Content>
							{#each reminderUnits as u (u.value)}
								<Select.Item value={u.value}>{u.label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>
		</div>
	</div>
</div>
