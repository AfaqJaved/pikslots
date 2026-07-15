<script lang="ts">
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import { getLocalTimeZone, today, type DateValue } from '@internationalized/date';
	import type { BusinessHours } from '@pikslots/shared';
	import { generateMockSlots } from '../../utils/mock-slots';
	import type { PublicSlot } from '../../types';
	import type { WeekdayKey } from '$utils/working-hours';

	let {
		durationInMins,
		bufferTimeInMins,
		businessHours,
		timeZone,
		onSelect
	}: {
		durationInMins: number;
		bufferTimeInMins: number;
		businessHours: BusinessHours;
		timeZone: string;
		onSelect: (date: string, slot: PublicSlot) => void;
	} = $props();

	let selectedDate = $state<DateValue>(today(getLocalTimeZone()));
	let selectedSlotStart = $state<string | null>(null);

	const dateString = $derived(
		`${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`
	);

	const slots = $derived(
		generateMockSlots({
			date: dateString,
			businessHours,
			timeZone,
			durationInMins,
			bufferTimeInMins
		})
	);

	function isDateDisabled(date: DateValue): boolean {
		const jsDate = date.toDate(getLocalTimeZone());
		const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' })
			.format(jsDate)
			.toLowerCase() as WeekdayKey;
		return !businessHours[weekday]?.enabled;
	}

	function formatSlotTime(iso: string): string {
		return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone }).format(
			new Date(iso)
		);
	}

	function selectSlot(slot: PublicSlot) {
		selectedSlotStart = slot.startTime;
		onSelect(dateString, slot);
	}

	$effect(() => {
		// Selecting a new date invalidates the previously chosen slot.
		dateString;
		selectedSlotStart = null;
	});
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-lg font-semibold">Select a date &amp; time</h2>

	<div class="flex flex-col gap-6 md:flex-row">
		<Calendar
			type="single"
			bind:value={selectedDate}
			minValue={today(getLocalTimeZone())}
			{isDateDisabled}
			class="border"
		/>

		<div class="flex min-w-48 flex-1 flex-col gap-2">
			<span class="text-xs font-medium text-muted-foreground">
				Times shown in {timeZone}
			</span>
			{#if slots.length === 0}
				<p class="py-6 text-sm text-muted-foreground">No availability on this day.</p>
			{:else}
				<div class="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto pr-1">
					{#each slots as slot (slot.startTime)}
						<button
							type="button"
							onclick={() => selectSlot(slot)}
							class="cursor-pointer border px-3 py-2 text-sm {selectedSlotStart === slot.startTime
								? 'border-primary bg-primary text-primary-foreground'
								: 'hover:border-foreground'}"
						>
							{formatSlotTime(slot.startTime)}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
