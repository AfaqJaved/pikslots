<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Field, FieldGroup, FieldLabel } from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import { editTimeoffMutationOptions } from '../../../api/timeoff/edit.timeoff.mutation';
	import { getLocalTimeZone, parseDate, today, type DateValue } from '@internationalized/date';
	import { formatIsoInTimezone, workingHourToUTC } from '@pikslots/datetime';
	import { businessStore } from '$stores/business.svelte';
	import type { FindTimeoffByIdResponse } from '@pikslots/shared';
	import CalendarIcon from '@lucide/svelte/icons/calendar';

	const REPEAT_OPTIONS = [
		{ value: 'none', label: 'Does not repeat' },
		{ value: 'daily', label: 'Daily (comming soon)' },
		{ value: 'weekly', label: 'Weekly (comming soon)' },
		{ value: 'monthly', label: 'Monthly (comming soon)' },
		{ value: 'yearly', label: 'Yearly (comming soon)' }
	] as const;

	let {
		open = $bindable(false),
		timeoff,
		userId,
		businessId
	}: {
		open: boolean;
		timeoff: FindTimeoffByIdResponse | null;
		userId: string;
		businessId: string;
	} = $props();

	const queryClient = useQueryClient();
	const editMutation = createMutation(() => editTimeoffMutationOptions());

	let title = $state('');
	let startDate = $state<DateValue>(today(getLocalTimeZone()));
	let startTime = $state('09:00');
	let endDate = $state<DateValue>(today(getLocalTimeZone()));
	let endTime = $state('17:00');
	let allDay = $state(false);
	let repeat = $state<(typeof REPEAT_OPTIONS)[number]['value']>('none');
	let startDateOpen = $state(false);
	let endDateOpen = $state(false);

	const repeatLabel = $derived(
		REPEAT_OPTIONS.find((option) => option.value === repeat)?.label ?? 'Does not repeat'
	);

	const businessTimezone = $derived(
		businessStore.selectedBusiness?.locationDetails.timeZone || getLocalTimeZone()
	);

	function loadFromTimeoff() {
		if (!timeoff) return;
		title = timeoff.title;
		startDate = parseDate(
			formatIsoInTimezone(timeoff.startDateTime, businessTimezone, 'yyyy-MM-dd')
		);
		endDate = parseDate(formatIsoInTimezone(timeoff.endDateTime, businessTimezone, 'yyyy-MM-dd'));
		startTime = formatIsoInTimezone(timeoff.startDateTime, businessTimezone, 'HH:mm');
		endTime = formatIsoInTimezone(timeoff.endDateTime, businessTimezone, 'HH:mm');
		allDay = timeoff.allDay;
		repeat = 'none';
	}

	$effect(() => {
		if (timeoff) loadFromTimeoff();
	});

	function formatDate(value: DateValue) {
		return value.toDate(getLocalTimeZone()).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function toIsoDateTime(date: DateValue, time: string) {
		return workingHourToUTC(date.toString(), time, businessTimezone);
	}

	function handleSave() {
		if (!title.trim() || !timeoff) return;

		editMutation.mutate({
			id: timeoff.id,
			title: title.trim(),
			userId,
			businessId,
			startDateTime: toIsoDateTime(startDate, allDay ? '00:00' : startTime),
			endDateTime: toIsoDateTime(endDate, allDay ? '00:00' : endTime),
			allDay,
			timeZone: businessTimezone,
			recurrence: null
		});
	}

	$effect(() => {
		if (editMutation.isSuccess) {
			queryClient.invalidateQueries({ queryKey: ['timeoffs', 'user', userId, businessId] });
			toast.success('Time off updated successfully');
			open = false;
			editMutation.reset();
		}

		if (editMutation.isError) {
			toast.error(editMutation.error?.response?.data?.message ?? 'Failed to update time off');
		}
	});
</script>

<Dialog.Root
	bind:open
	onOpenChange={(v) => {
		if (!v) loadFromTimeoff();
	}}
>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Edit time off</Dialog.Title>
		</Dialog.Header>

		<FieldGroup>
			<Field>
				<FieldLabel>Title</FieldLabel>
				<Input bind:value={title} placeholder="e.g. Vacation, Doctor's appointment" />
			</Field>

			<div class="grid grid-cols-2 gap-3">
				<Field>
					<FieldLabel>Start date</FieldLabel>
					<Popover.Root bind:open={startDateOpen}>
						<Popover.Trigger class="w-full">
							{#snippet child({ props })}
								<Button {...props} variant="outline" class="w-full justify-between font-normal">
									{formatDate(startDate)}
									<CalendarIcon class="text-muted-foreground" />
								</Button>
							{/snippet}
						</Popover.Trigger>
						<Popover.Content class="w-auto p-0" align="start">
							<Calendar
								type="single"
								value={startDate}
								captionLayout="dropdown"
								onValueChange={(value) => {
									if (!value) return;
									startDate = value;
									if (endDate.compare(startDate) < 0) endDate = startDate;
									startDateOpen = false;
								}}
							/>
						</Popover.Content>
					</Popover.Root>
				</Field>
				{#if !allDay}
					<Field>
						<FieldLabel>Start time</FieldLabel>
						<Input type="time" bind:value={startTime} />
					</Field>
				{/if}
				<Field>
					<FieldLabel>End date</FieldLabel>
					<Popover.Root bind:open={endDateOpen}>
						<Popover.Trigger class="w-full">
							{#snippet child({ props })}
								<Button {...props} variant="outline" class="w-full justify-between font-normal">
									{formatDate(endDate)}
									<CalendarIcon class="text-muted-foreground" />
								</Button>
							{/snippet}
						</Popover.Trigger>
						<Popover.Content class="w-auto p-0" align="start">
							<Calendar
								type="single"
								value={endDate}
								captionLayout="dropdown"
								minValue={startDate}
								onValueChange={(value) => {
									if (!value) return;
									endDate = value;
									endDateOpen = false;
								}}
							/>
						</Popover.Content>
					</Popover.Root>
				</Field>
				{#if !allDay}
					<Field>
						<FieldLabel>End time</FieldLabel>
						<Input type="time" bind:value={endTime} />
					</Field>
				{/if}
			</div>

			<div class="flex items-center gap-4">
				<Label class="flex items-center gap-2 font-normal">
					<Checkbox bind:checked={allDay} />
					All day
				</Label>

				<Select.Root type="single" bind:value={repeat}>
					<Select.Trigger class="w-[120px]">
						{repeatLabel}
					</Select.Trigger>
					<Select.Content>
						{#each REPEAT_OPTIONS as option (option.value)}
							<Select.Item value={option.value}>{option.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</FieldGroup>

		<Dialog.Footer>
			<Button variant="ghost" onclick={() => (open = false)} disabled={editMutation.isPending}>
				Cancel
			</Button>
			<Button onclick={handleSave} disabled={editMutation.isPending}>
				{editMutation.isPending ? 'Saving...' : 'Save'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
