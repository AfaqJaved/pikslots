<script lang="ts">
	import { Switch } from '$lib/components/ui/switch/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Plus from '@tabler/icons-svelte/icons/plus';
	import Trash from '@tabler/icons-svelte/icons/trash';

	const times = [
		'12:00 AM',
		'12:15 AM',
		'12:30 AM',
		'12:45 AM',
		'1:00 AM',
		'1:15 AM',
		'1:30 AM',
		'1:45 AM',
		'2:00 AM',
		'2:15 AM',
		'2:30 AM',
		'2:45 AM',
		'3:00 AM',
		'3:15 AM',
		'3:30 AM',
		'3:45 AM',
		'4:00 AM',
		'4:15 AM',
		'4:30 AM',
		'4:45 AM',
		'5:00 AM',
		'5:15 AM',
		'5:30 AM',
		'5:45 AM',
		'6:00 AM',
		'6:15 AM',
		'6:30 AM',
		'6:45 AM',
		'7:00 AM',
		'7:15 AM',
		'7:30 AM',
		'7:45 AM',
		'8:00 AM',
		'8:15 AM',
		'8:30 AM',
		'8:45 AM',
		'9:00 AM',
		'9:15 AM',
		'9:30 AM',
		'9:45 AM',
		'10:00 AM',
		'10:15 AM',
		'10:30 AM',
		'10:45 AM',
		'11:00 AM',
		'11:15 AM',
		'11:30 AM',
		'11:45 AM',
		'12:00 PM',
		'12:15 PM',
		'12:30 PM',
		'12:45 PM',
		'1:00 PM',
		'1:15 PM',
		'1:30 PM',
		'1:45 PM',
		'2:00 PM',
		'2:15 PM',
		'2:30 PM',
		'2:45 PM',
		'3:00 PM',
		'3:15 PM',
		'3:30 PM',
		'3:45 PM',
		'4:00 PM',
		'4:15 PM',
		'4:30 PM',
		'4:45 PM',
		'5:00 PM',
		'5:15 PM',
		'5:30 PM',
		'5:45 PM',
		'6:00 PM',
		'6:15 PM',
		'6:30 PM',
		'6:45 PM',
		'7:00 PM',
		'7:15 PM',
		'7:30 PM',
		'7:45 PM',
		'8:00 PM',
		'8:15 PM',
		'8:30 PM',
		'8:45 PM',
		'9:00 PM',
		'9:15 PM',
		'9:30 PM',
		'9:45 PM',
		'10:00 PM',
		'10:15 PM',
		'10:30 PM',
		'10:45 PM',
		'11:00 PM',
		'11:15 PM',
		'11:30 PM',
		'11:45 PM'
	];

	type Break = { start: string; end: string };
	type DayBreaks = { label: string; workday: boolean; enabled: boolean; breaks: Break[] };

	let days = $state<DayBreaks[]>([
		{
			label: 'Monday',
			workday: true,
			enabled: true,
			breaks: [
				{ start: '9:00 AM', end: '9:15 AM' },
				{ start: '9:00 AM', end: '9:15 AM' }
			]
		},
		{ label: 'Tuesday', workday: true, enabled: false, breaks: [] },
		{ label: 'Wednesday', workday: true, enabled: false, breaks: [] },
		{ label: 'Thursday', workday: true, enabled: false, breaks: [] },
		{ label: 'Friday', workday: true, enabled: false, breaks: [] },
		{ label: 'Saturday', workday: false, enabled: false, breaks: [] },
		{ label: 'Sunday', workday: false, enabled: false, breaks: [] }
	]);

	function addBreak(dayIndex: number) {
		days[dayIndex].breaks.push({ start: '9:00 AM', end: '9:15 AM' });
	}

	function removeBreak(dayIndex: number, breakIndex: number) {
		days[dayIndex].breaks.splice(breakIndex, 1);
	}
</script>

<div class="flex w-[60%] flex-col">
	<div class="flex flex-col px-6">
		<div class="flex flex-col divide-y divide-border/90 pt-4 pb-2">
			{#each days as day, di (day.label)}
				<div class="flex flex-col py-2">
					<div class="flex items-center gap-4">
						<!-- Toggle -->
						<Switch
							bind:checked={day.enabled}
							disabled={!day.workday}
							class={!day.workday ? 'opacity-40' : ''}
						/>

						<!-- Day label -->
						<span class="w-28 text-sm font-medium {!day.workday ? 'text-muted-foreground' : ''}">
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

					<!-- Break slots -->
					{#if day.enabled && day.breaks.length > 0}
						<div class="mt-1 flex flex-col gap-1 pl-[calc(1.25rem+1rem+7rem)]">
							{#each day.breaks as brk, bi (bi)}
								<div class="flex items-center gap-2">
									<Select.Root type="single" bind:value={brk.start}>
										<Select.Trigger class="w-28 text-sm">
											{brk.start}
										</Select.Trigger>
										<Select.Content class="max-h-60 overflow-y-auto">
											{#each times as t (t)}
												<Select.Item value={t}>{t}</Select.Item>
											{/each}
										</Select.Content>
									</Select.Root>

									<span class="text-muted-foreground">—</span>

									<Select.Root type="single" bind:value={brk.end}>
										<Select.Trigger class="w-28 text-sm">
											{brk.end}
										</Select.Trigger>
										<Select.Content class="max-h-60 overflow-y-auto">
											{#each times as t (t)}
												<Select.Item value={t}>{t}</Select.Item>
											{/each}
										</Select.Content>
									</Select.Root>

									<!-- Add button on last slot, delete on others -->
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

		<!-- Actions -->
		<div class="flex items-center justify-end gap-2 py-2">
			<Button variant="ghost">Cancel</Button>
			<Button>Save</Button>
		</div>
	</div>
</div>
