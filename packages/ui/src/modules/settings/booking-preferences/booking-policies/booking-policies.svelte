<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import InfoCircle from '@tabler/icons-svelte/icons/info-circle';
	import type { TimeUnit } from '@pikslots/shared';
	import { businessStore } from '../../../core/store/business.svelte';

	const business = $derived(businessStore.selectedBusiness);

	// ── Booking policies ───────────────────────────────────────────
	let leadTimeValue = $state('0');
	let leadTimeUnit = $state<TimeUnit>('minutes');

	let schedulingWindowValue = $state('0');
	let schedulingWindowUnit = $state<TimeUnit>('days');

	let slotSizeValue = $state('15');
	let slotSizeUnit = $state<TimeUnit>('minutes');

	let cancellationPolicyValue = $state('0');
	let cancellationPolicyUnit = $state<TimeUnit | 'none'>('none');

	let bookingPolicyText = $state('');
	let addPolicyToHome = $state(false);

	const leadTimeUnits: { value: TimeUnit; label: string }[] = [
		{ value: 'minutes', label: 'Minutes' },
		{ value: 'hours', label: 'Hours' }
	];
	const windowUnits: { value: TimeUnit; label: string }[] = [
		{ value: 'days', label: 'Days' },
		{ value: 'weeks', label: 'Weeks' },
		{ value: 'months', label: 'Months' }
	];
	const cancellationUnits: { value: TimeUnit | 'none'; label: string }[] = [
		{ value: 'none', label: 'any time' },
		{ value: 'minutes', label: 'Minutes' },
		{ value: 'hours', label: 'Hours' },
		{ value: 'days', label: 'Days' }
	];

	$effect(() => {
		if (business) {
			const p = business.bookingPolicies;
			leadTimeValue = String(p.leadTime.value);
			leadTimeUnit = p.leadTime.unit;
			schedulingWindowValue = String(p.scheduleWindow.value);
			schedulingWindowUnit = p.scheduleWindow.unit;
			if (p.cancellationPolicy) {
				cancellationPolicyValue = String(p.cancellationPolicy.value);
				cancellationPolicyUnit = p.cancellationPolicy.unit;
			} else {
				cancellationPolicyUnit = 'none';
			}
			bookingPolicyText = p.bookingPolicyText;
			addPolicyToHome = p.showPolicyOnBookingPage;
		}
	});
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
					{#if business === null}
						<Skeleton class="h-9 w-16 rounded-md" />
						<Skeleton class="h-9 w-32 rounded-md" />
					{:else}
						<Input type="number" bind:value={leadTimeValue} class="w-16 text-xs" min="0" />
						<Select.Root type="single" bind:value={leadTimeUnit}>
							<Select.Trigger class="w-32 text-xs">
								{leadTimeUnits.find((u) => u.value === leadTimeUnit)?.label ?? leadTimeUnit}
							</Select.Trigger>
							<Select.Content>
								{#each leadTimeUnits as u (u.value)}
									<Select.Item value={u.value}>{u.label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					{/if}
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
					{#if business === null}
						<Skeleton class="h-9 w-16 rounded-md" />
						<Skeleton class="h-9 w-32 rounded-md" />
					{:else}
						<Input type="number" bind:value={schedulingWindowValue} class="w-16 text-xs" min="0" />
						<Select.Root type="single" bind:value={schedulingWindowUnit}>
							<Select.Trigger class="w-32 text-xs">
								{windowUnits.find((u) => u.value === schedulingWindowUnit)?.label ??
									schedulingWindowUnit}
							</Select.Trigger>
							<Select.Content>
								{#each windowUnits as u (u.value)}
									<Select.Item value={u.value}>{u.label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					{/if}
				</div>
			</div>

			<!-- Booking slot size (local only) -->
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
						<Select.Trigger class="w-32 text-xs">
							{leadTimeUnits.find((u) => u.value === slotSizeUnit)?.label ?? slotSizeUnit}
						</Select.Trigger>
						<Select.Content>
							{#each leadTimeUnits as u (u.value)}
								<Select.Item value={u.value}>{u.label}</Select.Item>
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
				<div class="flex shrink-0 items-center gap-2">
					{#if business === null}
						<Skeleton class="h-9 w-16 rounded-md" />
						<Skeleton class="h-9 w-32 rounded-md" />
					{:else}
						{#if cancellationPolicyUnit !== 'none'}
							<Input
								type="number"
								bind:value={cancellationPolicyValue}
								class="w-16 text-xs"
								min="0"
							/>
						{/if}
						<Select.Root type="single" bind:value={cancellationPolicyUnit}>
							<Select.Trigger class="w-32 text-xs">
								{cancellationUnits.find((u) => u.value === cancellationPolicyUnit)?.label ??
									cancellationPolicyUnit}
							</Select.Trigger>
							<Select.Content>
								{#each cancellationUnits as u (u.value)}
									<Select.Item value={u.value}>{u.label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					{/if}
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
				{#if business === null}
					<Skeleton class="h-24 w-full rounded-md" />
				{:else}
					<textarea
						bind:value={bookingPolicyText}
						placeholder="Type your policy or share a link"
						rows={4}
						class="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
					></textarea>
				{/if}
				<div class="flex items-start gap-3">
					{#if business === null}
						<Skeleton class="mt-0.5 h-5 w-9 rounded-full" />
					{:else}
						<Switch bind:checked={addPolicyToHome} class="mt-0.5" />
					{/if}
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
