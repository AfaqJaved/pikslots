<script lang="ts">
	import type { BusinessHours } from '@pikslots/shared';
	import { fromHHmm, type WeekdayKey } from '$utils/working-hours';
	import { getTodayKey, getTimezoneLongName } from '../utils/business-hours-status';

	let { businessHours, timeZone }: { businessHours: BusinessHours; timeZone: string } = $props();

	const DISPLAY_ORDER: { key: WeekdayKey; label: string }[] = [
		{ key: 'sunday', label: 'Sunday' },
		{ key: 'monday', label: 'Monday' },
		{ key: 'tuesday', label: 'Tuesday' },
		{ key: 'wednesday', label: 'Wednesday' },
		{ key: 'thursday', label: 'Thursday' },
		{ key: 'friday', label: 'Friday' },
		{ key: 'saturday', label: 'Saturday' }
	];

	const todayKey = $derived(getTodayKey(timeZone));
	const timezoneLabel = $derived(getTimezoneLongName(timeZone));

	function formatHourLabel(hhmm: string): string {
		return fromHHmm(hhmm).replace(':00 ', ' ');
	}
</script>

<div class="flex flex-col text-sm">
	{#each DISPLAY_ORDER as { key, label } (key)}
		{@const day = businessHours[key]}
		{@const isToday = key === todayKey}
		<div class="flex items-center justify-between border-t border-border/70 py-2 first:border-t-0">
			<span class={isToday ? 'font-semibold' : 'text-muted-foreground'}>{label}</span>
			{#if day.enabled}
				<span class={isToday ? 'font-semibold' : 'text-muted-foreground'}>
					{formatHourLabel(day.openTime)} - {formatHourLabel(day.closeTime)}
				</span>
			{:else}
				<span class="text-muted-foreground">Closed</span>
			{/if}
		</div>
	{/each}
	<div class="pt-3 text-center text-xs text-muted-foreground">
		Time zone ({timezoneLabel})
	</div>
</div>
