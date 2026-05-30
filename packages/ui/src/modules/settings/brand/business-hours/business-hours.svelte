<script lang="ts">
	import { Switch } from '$lib/components/ui/switch/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Copy from '@tabler/icons-svelte/icons/copy';
	import type { WeekDay, BusinessHours } from '@pikslots/shared';
	import { businessStore } from '../../../core/store/business.svelte';
	import { createMutation } from '@tanstack/svelte-query';
	import { updateBusinessHours } from '../../../api/business/update.business.hours.mutation';
	import type {
		BusinessUpdateHoursInput,
		BusinessUpdateHoursResult
	} from '../../../api/business/models/business-model';
	import type { BaseErrorResponse } from '@pikslots/shared';
	import type { AxiosError } from 'axios';
	import { toast } from 'svelte-sonner';

	const business = $derived(businessStore.selectedBusiness);

	// ── Time conversion helpers ─────────────────────────────────────
	// '09:00' → '9:00 AM' / '17:00' → '5:00 PM'
	function fromHHmm(hhmm: string): string {
		const [h, m] = hhmm.split(':').map(Number);
		const period = h < 12 ? 'AM' : 'PM';
		const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
		return `${hour}:${String(m).padStart(2, '0')} ${period}`;
	}

	// '9:00 AM' → '09:00' / '5:00 PM' → '17:00'
	function toHHmm(display: string): string {
		const [time, period] = display.split(' ');
		let [h, m] = time.split(':').map(Number);
		if (period === 'AM' && h === 12) h = 0;
		if (period === 'PM' && h !== 12) h += 12;
		return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
	}

	const times = [
		'12:00 AM',
		'12:30 AM',
		'1:00 AM',
		'1:30 AM',
		'2:00 AM',
		'2:30 AM',
		'3:00 AM',
		'3:30 AM',
		'4:00 AM',
		'4:30 AM',
		'5:00 AM',
		'5:30 AM',
		'6:00 AM',
		'6:30 AM',
		'7:00 AM',
		'7:30 AM',
		'8:00 AM',
		'8:30 AM',
		'9:00 AM',
		'9:30 AM',
		'10:00 AM',
		'10:30 AM',
		'11:00 AM',
		'11:30 AM',
		'12:00 PM',
		'12:30 PM',
		'1:00 PM',
		'1:30 PM',
		'2:00 PM',
		'2:30 PM',
		'3:00 PM',
		'3:30 PM',
		'4:00 PM',
		'4:30 PM',
		'5:00 PM',
		'5:30 PM',
		'6:00 PM',
		'6:30 PM',
		'7:00 PM',
		'7:30 PM',
		'8:00 PM',
		'8:30 PM',
		'9:00 PM',
		'9:30 PM',
		'10:00 PM',
		'10:30 PM',
		'11:00 PM',
		'11:30 PM'
	];

	const DAYS: { key: WeekDay; label: string }[] = [
		{ key: 'monday', label: 'Monday' },
		{ key: 'tuesday', label: 'Tuesday' },
		{ key: 'wednesday', label: 'Wednesday' },
		{ key: 'thursday', label: 'Thursday' },
		{ key: 'friday', label: 'Friday' },
		{ key: 'saturday', label: 'Saturday' },
		{ key: 'sunday', label: 'Sunday' }
	];

	type DayState = { enabled: boolean; start: string; end: string };

	function hoursToState(hours: BusinessHours): Record<WeekDay, DayState> {
		return Object.fromEntries(
			DAYS.map(({ key }) => [
				key,
				{
					enabled: hours[key].enabled,
					start: fromHHmm(hours[key].openTime),
					end: fromHHmm(hours[key].closeTime)
				}
			])
		) as Record<WeekDay, DayState>;
	}

	let days = $state<Record<WeekDay, DayState>>({
		monday: { enabled: true, start: '9:00 AM', end: '5:00 PM' },
		tuesday: { enabled: true, start: '9:00 AM', end: '5:00 PM' },
		wednesday: { enabled: true, start: '9:00 AM', end: '5:00 PM' },
		thursday: { enabled: true, start: '9:00 AM', end: '5:00 PM' },
		friday: { enabled: true, start: '9:00 AM', end: '5:00 PM' },
		saturday: { enabled: false, start: '9:00 AM', end: '5:00 PM' },
		sunday: { enabled: false, start: '9:00 AM', end: '5:00 PM' }
	});

	$effect(() => {
		if (business) {
			console.log(business.businessHours);
			days = hoursToState(business.businessHours);
		}
	});

	const isDirty = $derived(
		!!business &&
			DAYS.some(({ key }) => {
				const stored = business.businessHours[key];
				const local = days[key];
				return (
					local.enabled !== stored.enabled ||
					toHHmm(local.start) !== stored.openTime ||
					toHHmm(local.end) !== stored.closeTime
				);
			})
	);

	const updateMutation = createMutation<
		BusinessUpdateHoursResult,
		AxiosError<BaseErrorResponse>,
		BusinessUpdateHoursInput
	>(() => ({
		mutationFn: updateBusinessHours
	}));

	$effect(() => {
		if (updateMutation.data) {
			businessStore.setSelectedBusiness(updateMutation.data);
			toast.success('Business hours saved successfully.');
		}
		if (updateMutation.isError) {
			toast.error(
				updateMutation.error?.response?.data?.message ?? 'Failed to save. Please try again.'
			);
		}
	});

	function handleSave() {
		if (!business) return;
		const businessHours = Object.fromEntries(
			DAYS.map(({ key }) => [
				key,
				{
					enabled: days[key].enabled,
					openTime: toHHmm(days[key].start),
					closeTime: toHHmm(days[key].end)
				}
			])
		) as BusinessHours;
		updateMutation.mutate({ id: business.id, businessHours: businessHours });
	}

	function handleCancel() {
		if (!business) {
			return;
		}
		days = hoursToState(business.businessHours);
	}

	function copyToAll(key: WeekDay) {
		const source = days[key];
		days = Object.fromEntries(
			DAYS.map(({ key: k }) => [
				k,
				k === key ? days[k] : { ...days[k], start: source.start, end: source.end }
			])
		) as Record<WeekDay, DayState>;
	}
</script>

<div class="flex flex-col">
	<!-- Page header -->
	<div class="flex items-center justify-between border-b px-6 py-4">
		<h1 class="text-base font-semibold">Business hours</h1>
		<div class="flex items-center gap-2">
			<Button
				variant="outline"
				size="sm"
				onclick={handleCancel}
				disabled={!isDirty || updateMutation.isPending}
			>
				Cancel
			</Button>
			<Button size="sm" onclick={handleSave} disabled={!isDirty || updateMutation.isPending}>
				{updateMutation.isPending ? 'Saving...' : 'Save'}
			</Button>
		</div>
	</div>

	<!-- Working hours content -->
	<div class="flex flex-col px-6">
		<p class="pt-4 pb-2 text-xs text-muted-foreground">
			What days and hours does your business operate? This determines your business availability.
		</p>

		<!-- Days list -->
		<div class="flex w-[60%] flex-col divide-y divide-border/90">
			{#each DAYS as { key, label }, i (key)}
				<div class="flex items-center gap-4 py-2">
					<!-- Toggle -->
					<Switch bind:checked={days[key].enabled} />

					<!-- Day label -->
					<span class="w-28 text-xs font-medium">{label}</span>

					{#if days[key].enabled}
						<!-- Start time -->
						<Select.Root type="single" bind:value={days[key].start}>
							<Select.Trigger class="w-28 text-xs">
								{days[key].start}
							</Select.Trigger>
							<Select.Content class="max-h-60 overflow-y-auto">
								{#each times as t (t)}
									<Select.Item value={t}>{t}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>

						<span class="text-muted-foreground">—</span>

						<!-- End time -->
						<Select.Root type="single" bind:value={days[key].end}>
							<Select.Trigger class="w-28 text-xs">
								{days[key].end}
							</Select.Trigger>
							<Select.Content class="max-h-60 overflow-y-auto">
								{#each times as t (t)}
									<Select.Item value={t}>{t}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>

						<!-- Copy to all (first day only) -->
						{#if i === 0}
							<Button
								variant="ghost"
								size="icon-sm"
								onclick={() => copyToAll(key)}
								title="Copy hours to all days"
								class="ml-auto"
							>
								<Copy size={15} />
							</Button>
						{/if}
					{:else}
						<span class="ml-auto rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground">
							Day off
						</span>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>
