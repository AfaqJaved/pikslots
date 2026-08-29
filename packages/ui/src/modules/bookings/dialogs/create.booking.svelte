<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Field, FieldGroup, FieldLabel, FieldError } from '$lib/components/ui/field/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import { registerBookingMutationOptions } from '../../api/booking/register.booking.mutation';
	import { getServicesByBusinessQueryOptions } from '../../api/service/get.services.by.business.query';
	import { debounceCustomerSearchQueryOptions } from '../../api/customer/debounce.customer.search.query';
	import { getFreeSlotsForUserQueryOptions } from '../../api/public-booking-page/get.free.slots.query';
	import type { SlotResponse } from '@pikslots/shared';
	import { businessStore } from '$stores/business.svelte';
	import { authStore } from '$stores/auth.svelte';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import { getLocalTimeZone, today, type DateValue } from '@internationalized/date';
	import axios from 'axios';
	import { superForm } from 'sveltekit-superforms';
	import { zod4 as zod } from 'sveltekit-superforms/adapters';
	import { CreateBookingSchema } from '../validations/create-booking-schema';
	import { formatCost, formatDuration } from '$utils/format-time-duration';
	import { untrack } from 'svelte';

	let {
		open = $bindable(false),
		selectedUserId,
		initialBookingDate,
		initialBookingStartTime,
		initialSlot
	}: {
		open: boolean;
		selectedUserId: string;
		initialBookingDate?: DateValue;
		initialBookingStartTime?: string;
		initialSlot?: SlotResponse;
	} = $props();

	const queryClient = useQueryClient();
	const jwtPayload = $derived(authStore.getPayloadData());
	const businessId = $derived(businessStore.selectedBusiness?.id || '');
	const businessCurrency = $derived(businessStore.selectedBusiness?.locationDetails.currency);
	const assigneeUserId = $derived(selectedUserId || jwtPayload?.userId || '');

	// ______ service Query _______________________________
	const servicesQuery = createQuery(() => ({
		...getServicesByBusinessQueryOptions(businessId),
		enabled: !!businessId
	}));

	// const servicesQuery = createQuery(() => ({
	// 	...getServicesByUserQueryOptions(selectedUserId),
	// 	enabled: !!selectedUserId
	// }));

	// const classesQuery = createQuery(() => ({
	// 	...getClassesByBusinessQueryOptions(businessId),
	// 	enabled: !!businessId
	// }));

	// _________ Customer Search (debounced) _____________________
	let customerSearch = $state('');
	let debouncedCustomerSearch = $state('');
	let selectedCustomerName = $state('');

	const customerSearchQuery = createQuery(() => ({
		...debounceCustomerSearchQueryOptions(businessId, debouncedCustomerSearch),
		enabled: !!businessId && debouncedCustomerSearch.trim().length > 0 && !$form.customerId
	}));

	const searchResults = $derived(customerSearchQuery.data ?? []);

	$effect(() => {
		const search = customerSearch;
		const timer = setTimeout(() => {
			// queryClient.invalidateQueries({
			// 	queryKey: ['customers-search',businessId , debouncedCustomerSearch]
			// })
			debouncedCustomerSearch = search;
		}, 500);
		return () => clearTimeout(timer);
	});

	function selectCustomer(id: string, name: string) {
		$form.customerId = id;
		selectedCustomerName = name;
		customerSearch = name;
		debouncedCustomerSearch = '';
	}

	function clearCustomer() {
		$form.customerId = '';
		selectedCustomerName = '';
		customerSearch = '';
		debouncedCustomerSearch = '';
	}

	function onCustomerSearchFocus() {
		if ($form.customerId) {
			$form.customerId = '';
			selectedCustomerName = '';
			customerSearch = '';
			debouncedCustomerSearch = '';
		}
	}

	const registerMutation = createMutation(registerBookingMutationOptions);

	const services = $derived(servicesQuery.data ?? []);

	let bookingDate = $state<DateValue>(today(getLocalTimeZone()));
	let bookingDateOpen = $state<boolean>(false);
	let bookingType = $state<string>('service');
	const businessTimezone = $derived(
		businessStore.selectedBusiness?.locationDetails.timeZone || getLocalTimeZone()
	);

	const dateString = $derived(
		`${bookingDate.year}-${String(bookingDate.month).padStart(2, '0')}-${String(bookingDate.day).padStart(2, '0')}`
	);

	// ── Superform ────────────────────────────────────────────────────────────────

	const { form, errors, enhance, submit, reset } = superForm(
		{
			serviceId: '',
			classId: '',
			customerId: '',
			startTime: '09:00',
			endTime: '10:00'
		},
		{
			validators: zod(CreateBookingSchema),
			SPA: true,
			resetForm: false,
			onUpdate: async ({ form }) => {
				if (form.valid) {
					const service = services.find((s) => s.id === form.data.serviceId);
					if (!service || !businessId) {
						toast.error('Please refresh the website and try again');
						return;
					}

					registerMutation.mutate({
						bookingDate: bookingDate.toString(),
						bookingStartTime: form.data.startTime,
						bookingEndTime: form.data.endTime,
						businessId,
						serviceId: form.data.serviceId,
						userId: assigneeUserId,
						customerId: form.data.customerId,
						serviceSnapshot: {
							title: service.title,
							durationInMins: service.durationInMins,
							cost: service.cost
						}
					});
				}
			}
		}
	);

	const selectedService = $derived(services.find((s) => s.id === $form.serviceId));

	// ── Free Slots Query ─────────────────────────────────────────────────────────

	const freeSlotsQuery = createQuery(() => ({
		...getFreeSlotsForUserQueryOptions({
			userId: assigneeUserId,
			businessId,
			date: dateString,
			durationInMins: selectedService?.durationInMins ?? 60,
			bufferTimeInMins: selectedService?.bufferTimeInMins ?? 0,
			businessTimezone
		}),
		enabled: !!businessId && !!assigneeUserId && !!selectedService && dateString.length > 0,
		placeholderData: (keepPreviousData) => keepPreviousData
	}));

	const freeSlots = $derived(freeSlotsQuery.data ?? []);

	function resetForm() {
		bookingDate = today(getLocalTimeZone());
		bookingType = 'service';
		customerSearch = '';
		debouncedCustomerSearch = '';
		selectedCustomerName = '';
		reset({
			data: {
				serviceId: '',
				classId: '',
				customerId: '',
				startTime: '09:00',
				endTime: '10:00'
			}
		});
	}

	function formatDate(value: DateValue) {
		return value.toDate(getLocalTimeZone()).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function formatSlotTime(iso: string): string {
		return new Intl.DateTimeFormat('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true,
			timeZone: businessTimezone
		}).format(new Date(iso));
	}

	const startTimeOptions = $derived(
		freeSlots.map((s) => ({ iso: s.startTime, label: formatSlotTime(s.startTime) }))
	);
	const endTimeOptions = $derived(
		freeSlots.map((s) => ({ iso: s.endTime, label: formatSlotTime(s.endTime) }))
	);

	function onStartChange(value: string) {
		const slot = freeSlots.find((s) => s.startTime === value);
		if (slot) {
			$form.startTime = slot.startTime;
			$form.endTime = slot.endTime;
		}
	}

	function onEndChange(value: string) {
		const slot = freeSlots.find((s) => s.endTime === value);
		if (slot) {
			$form.startTime = slot.startTime;
			$form.endTime = slot.endTime;
		}
	}

	$effect(() => {
		if (registerMutation.isSuccess) {
			queryClient.invalidateQueries({ queryKey: ['bookings-by-business-for-user'] });
			toast.success('Booking created successfully');
			open = false;
			resetForm();
			registerMutation.reset();
		}

		if (registerMutation.isError) {
			const error = registerMutation.error;
			if (axios.isAxiosError(error)) {
				toast.error(error?.response?.data?.message ?? 'Failed to create booking');
			}
		}
	});

	$effect(() => {
		if (open && initialBookingDate) {
			bookingDate = initialBookingDate;
		}
		if (open && initialSlot) {
			$form.startTime = initialSlot.startTime;
			$form.endTime = initialSlot.endTime;
		} else if (open && initialBookingStartTime) {
			$form.startTime = initialBookingStartTime;
		}
	});

	$effect(() => {
		const slots = freeSlots;
		untrack(() => {
			if (slots.length > 0) {
				$form.startTime = slots[0].startTime;
				$form.endTime = slots[0].endTime;
			} else {
				$form.startTime = '09:00';
				$form.endTime = '10:00';
			}
		});
	});
</script>

<Dialog.Root
	bind:open
	onOpenChange={(v) => {
		if (!v) resetForm();
	}}
>
	<Dialog.Content class="rounded-2xl sm:max-w-xl">
		<Dialog.Header>
			<Dialog.Title>Create Booking</Dialog.Title>
		</Dialog.Header>

		<form method="POST" use:enhance>
			<Tabs.Root bind:value={bookingType} class="w-full">
				<Tabs.List variant="line" class="justify-start px-0">
					<Tabs.Trigger value="service" class="cursor-pointer">Services</Tabs.Trigger>
					<!-- <Tabs.Trigger value="class">Classes</Tabs.Trigger> -->
				</Tabs.List>

				<!-- ── Services Tab ────────────────────────────────────────────── -->
				<!-- select a service -->
				<Tabs.Content value="service" class="mt-4">
					<FieldGroup>
						<Field>
							<FieldLabel>Service <span class="text-destructive">*</span></FieldLabel>
							<Select.Root type="single" bind:value={$form.serviceId}>
								<Select.Trigger
									class="w-full"
									disabled={services.length === 0}
									aria-invalid={$errors.serviceId ? true : undefined}
								>
									{$form.serviceId ? selectedService?.title : 'Select a service'}
								</Select.Trigger>
								<Select.Content>
									{#if services.length === 0}
										<Select.Item disabled value="No service available"
											>No services available</Select.Item
										>
									{:else}
										{#each services as service (service.id)}
											<Select.Item value={service.id}>
												{service.title} - {service.durationInMins} mins - {formatCost(
													service.cost / 100,
													businessCurrency || '$'
												)}
											</Select.Item>
										{/each}
									{/if}
								</Select.Content>
							</Select.Root>
							<FieldError errors={$errors.serviceId?.map((e) => ({ message: e }))} />
						</Field>

						<!-- search for a customer -->
						<Field>
							<FieldLabel>Customer <span class="text-destructive">*</span></FieldLabel>
							<div class="relative">
								<Input
									type="text"
									placeholder="Search customers..."
									bind:value={customerSearch}
									class={$errors.customerId ? 'border-destructive' : ''}
									onfocus={onCustomerSearchFocus}
								/>
								{#if $form.customerId || customerSearch.trim().length > 0}
									<button
										type="button"
										class="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
										onclick={clearCustomer}
									>
										&times;
									</button>
								{/if}
								{#if customerSearch.trim().length > 0 && !$form.customerId}
									<div
										class="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-popover shadow-md"
									>
										{#if customerSearchQuery.isPending}
											<div class="px-3 py-2 text-xs text-muted-foreground">Searching...</div>
										{:else if searchResults.length === 0}
											<div class="px-3 py-2 text-xs text-muted-foreground">No customers found</div>
										{:else}
											{#each searchResults as customer (customer.id)}
												<button
													type="button"
													class="flex w-full items-center border-2 border-b px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
													onclick={() =>
														selectCustomer(
															customer.id,
															`${customer.firstName} ${customer.lastName}`
														)}
												>
													{customer.firstName}
													{customer.lastName}
												</button>
											{/each}
										{/if}
									</div>
								{/if}
							</div>
							<FieldError errors={$errors.customerId?.map((e) => ({ message: e }))} />
						</Field>

						<Field>
							<FieldLabel>Date</FieldLabel>
							<Popover.Root bind:open={bookingDateOpen}>
								<Popover.Trigger class="w-full">
									{#snippet child({ props })}
										<Button {...props} variant="outline" class="w-full justify-between font-normal">
											{formatDate(bookingDate)}
											<CalendarIcon class="text-muted-foreground" />
										</Button>
									{/snippet}
								</Popover.Trigger>
								<Popover.Content class="w-auto p-0" align="start">
									<Calendar
										type="single"
										value={bookingDate}
										captionLayout="dropdown"
										minValue={today(getLocalTimeZone())}
										onValueChange={(value) => {
											if (!value) return;
											bookingDate = value;
											bookingDateOpen = false;
										}}
									/>
								</Popover.Content>
							</Popover.Root>
						</Field>

						{#if selectedService}
							{#if freeSlotsQuery.isPending && !!selectedService}
								<p class="text-xs text-muted-foreground">Loading available times...</p>
							{:else if freeSlots.length === 0}
								<p class="text-xs text-muted-foreground">No available times Slots for this date</p>
							{:else}
								<div class="grid grid-cols-2 gap-3">
									<Field>
										<FieldLabel>Start Time <span class="text-destructive">*</span></FieldLabel>
										<Select.Root
											type="single"
											value={$form.startTime}
											onValueChange={onStartChange}
										>
											<Select.Trigger class="w-full">
												{startTimeOptions.find((o) => o.iso === $form.startTime)?.label ??
													'Select start'}
											</Select.Trigger>
											<Select.Content viewportClass="max-h-60">
												{#each startTimeOptions as opt (opt.iso)}
													<Select.Item value={opt.iso}>{opt.label}</Select.Item>
												{/each}
											</Select.Content>
										</Select.Root>
									</Field>
									<Field>
										<FieldLabel>End Time <span class="text-destructive">*</span></FieldLabel>
										<Select.Root type="single" value={$form.endTime} onValueChange={onEndChange}>
											<Select.Trigger class="w-full">
												{endTimeOptions.find((o) => o.iso === $form.endTime)?.label ?? 'Select end'}
											</Select.Trigger>
											<Select.Content viewportClass="max-h-60">
												{#each endTimeOptions as opt (opt.iso)}
													<Select.Item value={opt.iso}>{opt.label}</Select.Item>
												{/each}
											</Select.Content>
										</Select.Root>
									</Field>
								</div>
							{/if}
						{/if}

						{#if selectedService}
							<div class="rounded-md bg-muted p-3 text-sm">
								<p class="pb-2 font-medium">{selectedService.title}</p>
								<p class="text-muted-foreground">
									Duration: {formatDuration(selectedService.durationInMins)} mins
									<br /> Cost: {formatCost(selectedService.cost / 100, businessCurrency || '$')}
								</p>
							</div>
						{/if}
					</FieldGroup>
				</Tabs.Content>

				<!-- ── Classes Tab ─────────────────────────────────────────────── -->
				<!-- <Tabs.Content value="class">
					<FieldGroup>
						<Field>
							<FieldLabel>Class <span class="text-destructive">*</span></FieldLabel>
							<Select.Root type="single" bind:value={$form.classId}>
								<Select.Trigger class="w-full" disabled={classes.length === 0}>
									{$form.classId ? selectedClass?.title : 'Select a class'}
								</Select.Trigger>
								<Select.Content>
									{#if classes.length === 0}
										<Select.Item disabled value="No class available"
											>No classes available</Select.Item
										>
									{:else}
										{#each classes as cls (cls.id)}
											<Select.Item value={cls.id}>
												{cls.title} - {cls.durationInMins} mins - {cls.seats} seats - ${cls.cost}
											</Select.Item>
										{/each}
									{/if}
								</Select.Content>
							</Select.Root>
						</Field>

						<Field>
							<FieldLabel>Customer <span class="text-destructive">*</span></FieldLabel>
							<Select.Root type="single" bind:value={$form.customerId}>
								<Select.Trigger class="w-full" disabled={customers.length === 0}>
									{$form.customerId
										? `${selectedCustomer?.firstName} ${selectedCustomer?.lastName}`
										: 'Select a customer'}
								</Select.Trigger>
								<Select.Content>
									{#if customers.length === 0}
										<Select.Item disabled value="No customer available"
											>No customers available</Select.Item
										>
									{:else}
										{#each customers as customer (customer.id)}
											<Select.Item value={customer.id}>
												{customer.firstName}
												{customer.lastName}
											</Select.Item>
										{/each}
									{/if}
								</Select.Content>
							</Select.Root>
						</Field>

						<Field>
							<FieldLabel>Date & Time</FieldLabel>
							<div class="grid grid-cols-3 gap-3">
								<div class="col-span-1">
									<FieldLabel class="text-xs">Date</FieldLabel>
									<Popover.Root bind:open={bookingDateOpen}>
										<Popover.Trigger class="w-full">
											{#snippet child({ props })}
												<Button
													{...props}
													variant="outline"
													class="w-full justify-between font-normal"
												>
													{formatDate(bookingDate)}
													<CalendarIcon class="text-muted-foreground" />
												</Button>
											{/snippet}
										</Popover.Trigger>
										<Popover.Content class="w-auto p-0" align="start">
											<Calendar
												type="single"
												value={bookingDate}
												captionLayout="dropdown"
												minValue={today(getLocalTimeZone())}
												onValueChange={(value) => {
													if (!value) return;
													bookingDate = value;
													bookingDateOpen = false;
												}}
											/>
										</Popover.Content>
									</Popover.Root>
								</div>
								<Field>
									<FieldLabel class="text-xs"
										>Start time <span class="text-destructive">*</span></FieldLabel
									>
									<Input type="time" bind:value={$form.startTime} />
								</Field>
								<Field>
									<FieldLabel class="text-xs"
										>End time <span class="text-destructive">*</span></FieldLabel
									>
									<Input type="time" bind:value={$form.endTime} />
								</Field>
							</div>
						</Field>

						{#if selectedClass}
							<div class="rounded-md bg-muted p-3 text-sm">
								<p class="font-medium">{selectedClass.title}</p>
								<p class="text-muted-foreground">
									Duration: {selectedClass.durationInMins} mins | Seats: {selectedClass.seats} | Cost:
									${selectedClass.cost}
								</p>
							</div>
						{/if}

						<p class="text-xs text-muted-foreground">Class booking support coming soon.</p>
					</FieldGroup>
				</Tabs.Content> -->
			</Tabs.Root>

			<Dialog.Footer class="mt-4">
				<Button
					type="button"
					variant="ghost"
					onclick={() => (open = false)}
					disabled={registerMutation.isPending}
				>
					Cancel
				</Button>
				{#if bookingType === 'service'}
					<Button type="button" onclick={submit} disabled={registerMutation.isPending}>
						{registerMutation.isPending ? 'Creating...' : 'Create Booking'}
					</Button>
				{:else}
					<Button type="button" disabled>Coming Soon</Button>
				{/if}
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
