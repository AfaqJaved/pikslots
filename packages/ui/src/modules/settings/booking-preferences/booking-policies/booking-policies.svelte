<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import InfoCircle from '@tabler/icons-svelte/icons/info-circle';

	// ── Booking policies ───────────────────────────────────────────
	let leadTimeValue = $state('0');
	let leadTimeUnit = $state('Minutes');

	let schedulingWindowValue = $state('0');
	let schedulingWindowUnit = $state('Days');

	let slotSizeValue = $state('15');
	let slotSizeUnit = $state('Minutes');

	let cancellationPolicy = $state('Anytime');

	let bookingPolicyText = $state('');
	let addPolicyToHome = $state(false);

	const timeUnits = ['Minutes', 'Hours'];
	const windowUnits = ['Days', 'Weeks', 'Months'];
	const cancellationOptions = [
		'Anytime',
		'1 hour before',
		'2 hours before',
		'24 hours before',
		'48 hours before'
	];
</script>

<div class="flex flex-col">
	<!-- Page header -->
	<div class="flex items-center justify-between border-b px-6 py-4">
		<h1 class="text-base font-semibold">Booking preferences</h1>
		<Button>Save</Button>
	</div>

	<div class="flex w-[60%] flex-col gap-2 px-6 py-4">
		<!-- Booking policies section -->
		<h2 class="mb-1 text-sm font-semibold">Booking policies</h2>

		<div class="flex flex-col gap-0">
			<!-- Lead time -->
			<div class="flex items-start justify-between gap-6 py-2.5">
				<div class="flex flex-col gap-0.5">
					<span class="text-xs font-medium">Lead time</span>
					<span class="text-xs text-muted-foreground"
						>How much notice do you require before an appointment?</span
					>
				</div>
				<div class="flex shrink-0 items-center gap-2">
					<Input type="number" bind:value={leadTimeValue} class="w-16 text-xs" min="0" />
					<Select.Root type="single" bind:value={leadTimeUnit}>
						<Select.Trigger class="w-32 text-xs">{leadTimeUnit}</Select.Trigger>
						<Select.Content>
							{#each timeUnits as u (u)}
								<Select.Item value={u}>{u}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>

			<!-- Scheduling window -->
			<div class="flex items-start justify-between gap-6 py-2.5">
				<div class="flex flex-col gap-0.5">
					<span class="text-xs font-medium">Scheduling window</span>
					<span class="text-xs text-muted-foreground"
						>How far in advance can customers schedule an appointment?</span
					>
				</div>
				<div class="flex shrink-0 items-center gap-2">
					<Input type="number" bind:value={schedulingWindowValue} class="w-16 text-xs" min="0" />
					<Select.Root type="single" bind:value={schedulingWindowUnit}>
						<Select.Trigger class="w-32 text-xs">{schedulingWindowUnit}</Select.Trigger>
						<Select.Content>
							{#each windowUnits as u (u)}
								<Select.Item value={u}>{u}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>

			<!-- Booking slot size -->
			<div class="flex items-start justify-between gap-6 py-2.5">
				<div class="flex flex-col gap-0.5">
					<div class="flex items-center gap-1.5">
						<span class="text-xs font-medium">Booking slot size</span>
						<InfoCircle size={14} class="text-muted-foreground" />
					</div>
					<span class="text-xs text-muted-foreground"
						>How often should available booking slots appear?</span
					>
				</div>
				<div class="flex shrink-0 items-center gap-2">
					<Input type="number" bind:value={slotSizeValue} class="w-16 text-xs" min="1" />
					<Select.Root type="single" bind:value={slotSizeUnit}>
						<Select.Trigger class="w-32 text-xs">{slotSizeUnit}</Select.Trigger>
						<Select.Content>
							{#each timeUnits as u (u)}
								<Select.Item value={u}>{u}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>

			<!-- Cancellation policy -->
			<div class="flex items-start justify-between gap-6 py-2.5">
				<div class="flex flex-col gap-0.5">
					<span class="text-xs font-medium">Cancellation policy</span>
					<span class="text-xs text-muted-foreground"
						>How soon before an appointment can customers reschedule or cancel?</span
					>
				</div>
				<div class="shrink-0">
					<Select.Root type="single" bind:value={cancellationPolicy}>
						<Select.Trigger class="w-40 text-xs">{cancellationPolicy}</Select.Trigger>
						<Select.Content>
							{#each cancellationOptions as o (o)}
								<Select.Item value={o}>{o}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>

			<!-- Booking policy text -->
			<div class="flex flex-col gap-2.5 py-2.5">
				<div class="flex flex-col gap-0.5">
					<span class="text-xs font-medium">Booking policy</span>
					<span class="text-xs text-muted-foreground">
						Share need-to-know details — about amending bookings, refunds and more — before
						customers confirm their bookings.
					</span>
				</div>
				<textarea
					bind:value={bookingPolicyText}
					placeholder="Type your policy or share a link"
					rows={4}
					class="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
				></textarea>
				<div class="flex items-start gap-3">
					<Switch bind:checked={addPolicyToHome} class="mt-0.5" />
					<div class="flex flex-col gap-0.5">
						<span class="text-xs font-medium">Add policy to home</span>
						<span class="text-xs text-muted-foreground"
							>Display your booking policy at the top of your Booking Page to draw extra attention.</span
						>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
