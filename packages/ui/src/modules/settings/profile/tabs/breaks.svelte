<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import Plus from '@tabler/icons-svelte/icons/plus';
	import Trash from '@tabler/icons-svelte/icons/trash';
	import { WEEKDAYS, quarterHourTimes } from '$utils/working-hours';
	import type { UserWorkingHoursResponse } from '@pikslots/shared';

	let { userWorkingHours }: { userWorkingHours: UserWorkingHoursResponse | undefined } = $props();

	type Break = { start: string; end: string };
	type DayBreaks = { label: string; workday: boolean; enabled: boolean; breaks: Break[] };

	let breakDays = $state<DayBreaks[]>([]);

	$effect(() => {
		if (!userWorkingHours) return;
		breakDays = WEEKDAYS.map((day) => ({
			label: day.charAt(0).toUpperCase() + day.slice(1),
			workday: userWorkingHours[day].enabled,
			enabled: false,
			breaks: [] as Break[]
		}));
	});

	function addBreak(dayIndex: number) {
		breakDays[dayIndex].breaks.push({ start: '9:00 AM', end: '9:15 AM' });
	}

	function removeBreak(dayIndex: number, breakIndex: number) {
		breakDays[dayIndex].breaks.splice(breakIndex, 1);
	}
</script>

<div class="flex w-[60%] flex-col px-6">
	<div class="flex flex-col divide-y divide-border/90 pt-4 pb-2">
		{#each breakDays as day, di (day.label)}
			<div class="flex flex-col py-2">
				<div class="flex items-center gap-4">
					<Switch
						bind:checked={day.enabled}
						disabled={!day.workday}
						class={!day.workday ? 'opacity-40' : ''}
					/>

					<span class="w-28 text-xs font-medium {!day.workday ? 'text-muted-foreground' : ''}">
						{day.label}
					</span>

					{#if !day.workday}
						<span class="ml-auto text-xs text-muted-foreground">Day off</span>
					{:else if day.enabled && day.breaks.length === 0}
						<span class="ml-auto text-xs text-muted-foreground">No breaks</span>
						<Button variant="ghost" size="icon-sm" onclick={() => addBreak(di)} class="ml-2">
							<Plus size={14} />
						</Button>
					{:else if !day.enabled}
						<span class="ml-auto text-xs text-muted-foreground">No breaks</span>
					{/if}
				</div>

				{#if day.enabled && day.breaks.length > 0}
					<div class="mt-1 flex flex-col gap-1 pl-[calc(1.25rem+1rem+7rem)]">
						{#each day.breaks as brk, bi (bi)}
							<div class="flex items-center gap-2">
								<Select.Root type="single" bind:value={brk.start}>
									<Select.Trigger class="w-28 text-xs">
										{brk.start}
									</Select.Trigger>
									<Select.Content class="max-h-60 overflow-y-auto">
										{#each quarterHourTimes as t (t)}
											<Select.Item value={t}>{t}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>

								<span class="text-muted-foreground">—</span>

								<Select.Root type="single" bind:value={brk.end}>
									<Select.Trigger class="w-28 text-xs">
										{brk.end}
									</Select.Trigger>
									<Select.Content class="max-h-60 overflow-y-auto">
										{#each quarterHourTimes as t (t)}
											<Select.Item value={t}>{t}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>

								{#if bi === day.breaks.length - 1}
									<Button variant="ghost" size="icon-sm" onclick={() => addBreak(di)}>
										<Plus size={14} />
									</Button>
								{:else}
									<Button
										variant="ghost"
										size="icon-sm"
										onclick={() => removeBreak(di, bi)}
										class="text-muted-foreground hover:text-destructive"
									>
										<Trash size={14} />
									</Button>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<div class="flex items-center justify-end gap-2 py-2">
		<Button variant="ghost">Cancel</Button>
		<Button>Save</Button>
	</div>
</div>
