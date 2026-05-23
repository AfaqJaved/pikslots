<script lang="ts">
	import { Switch } from '$lib/components/ui/switch/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Copy from '@tabler/icons-svelte/icons/copy';
	import InfoCircle from '@tabler/icons-svelte/icons/info-circle';

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

	type DaySchedule = {
		label: string;
		enabled: boolean;
		start: string;
		end: string;
	};

	let days = $state<DaySchedule[]>([
		{ label: 'Monday', enabled: true, start: '9:00 AM', end: '5:00 PM' },
		{ label: 'Tuesday', enabled: true, start: '9:00 AM', end: '5:00 PM' },
		{ label: 'Wednesday', enabled: true, start: '9:00 AM', end: '5:00 PM' },
		{ label: 'Thursday', enabled: true, start: '9:00 AM', end: '5:00 PM' },
		{ label: 'Friday', enabled: true, start: '9:00 AM', end: '5:00 PM' },
		{ label: 'Saturday', enabled: false, start: '9:00 AM', end: '5:00 PM' },
		{ label: 'Sunday', enabled: false, start: '9:00 AM', end: '5:00 PM' }
	]);

	function copyToAll(index: number) {
		const source = days[index];
		days = days.map((d, i) => (i === index ? d : { ...d, start: source.start, end: source.end }));
	}
</script>

<div class="flex flex-col">
	<!-- Working hours content -->
	<div class="flex flex-col px-6">
		<p class="pt-4 pb-2 text-xs text-muted-foreground">
			What days and hours does you business operate? This determines your business availability.
		</p>

		<!-- Days list -->
		<div class="flex w-[60%] flex-col divide-y divide-border/90">
			{#each days as day, i (day.label)}
				<div class="flex items-center gap-4 py-2">
					<!-- Toggle -->
					<Switch bind:checked={day.enabled} />

					<!-- Day label -->
					<span class="w-28 text-xs font-medium">{day.label}</span>

					{#if day.enabled}
						<!-- Start time -->
						<Select.Root type="single" bind:value={day.start}>
							<Select.Trigger class="w-28 text-xs">
								{day.start}
							</Select.Trigger>
							<Select.Content class="max-h-60 overflow-y-auto">
								{#each times as t (t)}
									<Select.Item value={t}>{t}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>

						<span class="text-muted-foreground">—</span>

						<!-- End time -->
						<Select.Root type="single" bind:value={day.end}>
							<Select.Trigger class="w-28 text-xs">
								{day.end}
							</Select.Trigger>
							<Select.Content class="max-h-60 overflow-y-auto">
								{#each times as t (t)}
									<Select.Item value={t}>{t}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>

						<!-- Copy to all (first enabled day only) -->
						{#if i === 0}
							<Button
								variant="ghost"
								size="icon-sm"
								onclick={() => copyToAll(i)}
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

		<!-- Info note -->
		<!-- <div class="flex items-start gap-2 py-2 text-xs text-muted-foreground"> -->
		<!-- 	<InfoCircle size={15} class="mt-0.5 shrink-0" /> -->
		<!-- 	<p> -->
		<!-- 		To update when your overall business opens and closes, go to -->
		<!-- 		<a -->
		<!-- 			href="/home/settings/brand/business-hours" -->
		<!-- 			class="font-medium text-foreground underline underline-offset-2" -->
		<!-- 		> -->
		<!-- 			Your brand -->
		<!-- 		</a> -->
		<!-- 		and select <span class="font-medium text-foreground">Business hours</span>. -->
		<!-- 	</p> -->
		<!-- </div> -->
	</div>
</div>
