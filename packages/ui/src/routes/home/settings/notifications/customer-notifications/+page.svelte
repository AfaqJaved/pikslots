<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Select from '$lib/components/ui/select/index.js';

	// ── Updates ────────────────────────────────────────────────────
	let confirmations = $state(true);
	let changes = $state(true);
	let cancellations = $state(true);

	// ── Reminders ──────────────────────────────────────────────────
	let reminder1 = $state(true);
	let reminder1Value = $state('1');
	let reminder1Unit = $state('Days');

	let reminder2 = $state(false);
	let reminder2Value = $state('12');
	let reminder2Unit = $state('Hours');

	const reminderUnits = ['Minutes', 'Hours', 'Days', 'Weeks'];

	// ── Customization ──────────────────────────────────────────────
	let senderName = $state('Afaq');
	let emailSignature = $state('Thanks,');
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
			<span class="text-xs text-muted-foreground">Select the real-time updates your customers will receive.</span>
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
				<span class="text-xs text-muted-foreground">Reduce no-shows and rescheduling with automatic booking reminders.</span>
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
						<Select.Trigger class="w-28 text-xs">{reminder1Unit}</Select.Trigger>
						<Select.Content>
							{#each reminderUnits as u (u)}
								<Select.Item value={u}>{u}</Select.Item>
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
					<Input
						type="number"
						bind:value={reminder2Value}
						disabled
						class="w-16 text-xs"
					/>
					<Select.Root type="single" bind:value={reminder2Unit} disabled>
						<Select.Trigger class="w-28 text-xs">{reminder2Unit}</Select.Trigger>
						<Select.Content>
							{#each reminderUnits as u (u)}
								<Select.Item value={u}>{u}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>
		</div>

		<!-- Customization -->
		<div class="flex flex-col gap-4">
			<h2 class="text-sm font-semibold">Customization</h2>

			<div class="flex flex-col gap-3">
				<span class="text-xs font-medium">Emails</span>

				<div class="flex flex-col gap-1">
					<span class="text-xs text-muted-foreground">Sender name</span>
					<Input bind:value={senderName} class="text-xs" />
				</div>

				<div class="flex flex-col gap-1">
					<span class="text-xs text-muted-foreground">Email signature</span>
					<textarea
						bind:value={emailSignature}
						rows={3}
						class="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
					></textarea>
				</div>
			</div>
		</div>

	</div>
</div>
