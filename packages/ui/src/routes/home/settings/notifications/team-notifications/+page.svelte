<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import Plus from '@tabler/icons-svelte/icons/plus';

	// ── Updates ────────────────────────────────────────────────────
	let confirmations = $state(true);
	let changes = $state(true);
	let cancellations = $state(true);

	// ── Reminders ──────────────────────────────────────────────────
	let emailReminder = $state(true);
	let reminderValue = $state('1');
	let reminderUnit = $state('Days');

	const reminderUnits = ['Minutes', 'Hours', 'Days', 'Weeks'];

	// ── CC email ───────────────────────────────────────────────────
	let ccEmails = $state<string[]>([]);
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

		<!-- Team notifications -->
		<div class="flex flex-col gap-0.5">
			<h2 class="text-sm font-semibold">Team notifications</h2>
			<span class="text-xs text-muted-foreground">Select the real-time updates your team will receive.</span>
		</div>

		<!-- Updates -->
		<div class="flex flex-col gap-3">
			<div class="flex flex-col gap-0.5">
				<span class="text-xs font-medium">Updates</span>
				<span class="text-xs text-muted-foreground">Automate notifications for new, edited and cancelled bookings</span>
			</div>

			<div class="flex flex-col gap-3">
				<div class="flex items-start gap-3">
					<Checkbox bind:checked={confirmations} class="mt-0.5" />
					<div class="flex flex-col gap-0.5">
						<span class="text-xs font-medium">Confirmations</span>
						<span class="text-xs text-muted-foreground">Automate notifications for new bookings</span>
					</div>
				</div>

				<div class="flex items-start gap-3">
					<Checkbox bind:checked={changes} class="mt-0.5" />
					<div class="flex flex-col gap-0.5">
						<span class="text-xs font-medium">Changes</span>
						<span class="text-xs text-muted-foreground">Automate notifications for edited or rescheduled bookings</span>
					</div>
				</div>

				<div class="flex items-start gap-3">
					<Checkbox bind:checked={cancellations} class="mt-0.5" />
					<div class="flex flex-col gap-0.5">
						<span class="text-xs font-medium">Cancellations</span>
						<span class="text-xs text-muted-foreground">Automate notifications for cancelled bookings</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Reminders -->
		<div class="flex flex-col gap-3">
			<div class="flex flex-col gap-0.5">
				<span class="text-xs font-medium">Reminders</span>
				<span class="text-xs text-muted-foreground">Keep team members in the loop with automatic booking reminders.</span>
			</div>

			<div class="flex items-start justify-between gap-6">
				<div class="flex items-start gap-3">
					<Checkbox bind:checked={emailReminder} class="mt-0.5" />
					<div class="flex flex-col gap-0.5">
						<span class="text-xs font-medium">Email</span>
						<span class="text-xs text-muted-foreground">Prior to each appointment</span>
					</div>
				</div>
				<div class="flex shrink-0 items-center gap-2">
					<Input
						type="number"
						bind:value={reminderValue}
						disabled={!emailReminder}
						class="w-16 text-xs"
						min="1"
					/>
					<Select.Root type="single" bind:value={reminderUnit} disabled={!emailReminder}>
						<Select.Trigger class="w-28 text-xs">{reminderUnit}</Select.Trigger>
						<Select.Content>
							{#each reminderUnits as u (u)}
								<Select.Item value={u}>{u}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>
		</div>

		<!-- CC email notifications -->
		<div class="flex flex-col gap-3">
			<div class="flex flex-col gap-0.5">
				<span class="text-xs font-medium">CC email notifications</span>
				<span class="text-xs text-muted-foreground">Send all team appointment updates to additional email addresses.</span>
			</div>

			<Button variant="ghost" class="w-fit gap-1.5 px-0 text-xs font-medium text-muted-foreground">
				<Plus size={14} />
				Add an email
			</Button>
		</div>

	</div>
</div>
