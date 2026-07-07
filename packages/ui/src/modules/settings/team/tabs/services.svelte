<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Search from '@tabler/icons-svelte/icons/search';
	import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import { getServicesByUserQueryOptions } from '../../../api/service-user-assignment/get.services.by.user.query';
	import { getServicesByBusinessQueryOptions } from '../../../api/service/get.services.by.business.query';
	import { assignServiceMutationOptions } from '../../../api/service-user-assignment/assign.service.mutation';
	import { removeServiceMutationOptions } from '../../../api/service-user-assignment/remove.service.mutation';

	let { userId, businessId }: { userId: string; businessId: string } = $props();

	const queryClient = useQueryClient();

	const userServicesQuery = createQuery(() => getServicesByUserQueryOptions(userId));
	const allServicesQuery = createQuery(() => getServicesByBusinessQueryOptions(businessId));

	const assignMut = createMutation(() => assignServiceMutationOptions());
	const removeMut = createMutation(() => removeServiceMutationOptions());

	let dialogOpen = $state(false);
	let dialogSearch = $state('');

	// Set of selected service IDs in dialog (initialized when dialog opens)
	let selectedIds = $state(new Set<string>());

	function openDialog() {
		selectedIds = new Set((userServicesQuery.data ?? []).map((s) => s.id));
		dialogSearch = '';
		dialogOpen = true;
	}

	const filteredServices = $derived(
		(allServicesQuery.data ?? []).filter((s) =>
			s.title.toLowerCase().includes(dialogSearch.toLowerCase())
		)
	);

	const allSelected = $derived(
		filteredServices.length > 0 && filteredServices.every((s) => selectedIds.has(s.id))
	);

	function toggleSelectAll() {
		if (allSelected) {
			const next = new Set(selectedIds);
			filteredServices.forEach((s) => next.delete(s.id));
			selectedIds = next;
		} else {
			const next = new Set(selectedIds);
			filteredServices.forEach((s) => next.add(s.id));
			selectedIds = next;
		}
	}

	function toggleService(id: string) {
		const next = new Set(selectedIds);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		selectedIds = next;
	}

	const isPending = $derived(assignMut.isPending || removeMut.isPending);

	async function handleUpdate() {
		const current = new Set((userServicesQuery.data ?? []).map((s) => s.id));
		const all = allServicesQuery.data ?? [];

		const toAssign = all.filter((s) => selectedIds.has(s.id) && !current.has(s.id));
		const toRemove = all.filter((s) => !selectedIds.has(s.id) && current.has(s.id));

		try {
			await Promise.all([
				...toAssign.map((s) =>
					assignMut.mutateAsync({ serviceId: s.id, userId, businessId })
				),
				...toRemove.map((s) => removeMut.mutateAsync({ serviceId: s.id, userId }))
			]);

			await queryClient.invalidateQueries({
				queryKey: ['service-user-assignments', 'by-user', userId]
			});

			toast.success('Services updated');
			dialogOpen = false;
		} catch {
			toast.error('Failed to update services');
		}
	}
</script>

<div class="px-6 pt-4">
	<Button variant="outline" size="sm" class="cursor-pointer" onclick={openDialog}>
		Manage services
	</Button>

	<div class="mt-4 flex flex-col gap-2">
		{#if userServicesQuery.isPending}
			<p class="text-xs text-muted-foreground">Loading...</p>
		{:else if (userServicesQuery.data ?? []).length === 0}
			<p class="text-xs text-muted-foreground">No services configured.</p>
		{:else}
			{#each userServicesQuery.data ?? [] as service (service.id)}
				<div class="flex items-center gap-3 rounded-lg border px-4 py-3">
					<span class="text-sm">{service.title}</span>
				</div>
			{/each}
		{/if}
	</div>
</div>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Content class="max-w-sm">
		<Dialog.Header>
			<Dialog.Title>Services</Dialog.Title>
		</Dialog.Header>

		<div class="flex flex-col gap-3">
			<!-- Search -->
			<div class="relative">
				<Search
					size={14}
					class="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
				/>
				<Input bind:value={dialogSearch} placeholder="Search" class="pl-8 text-xs" />
			</div>

			<!-- Select all row -->
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<Checkbox
						checked={allSelected}
						onCheckedChange={toggleSelectAll}
						id="select-all"
					/>
					<label for="select-all" class="cursor-pointer text-sm font-medium">Select all</label>
				</div>
				<span class="text-xs text-muted-foreground">
					{selectedIds.size}/{allServicesQuery.data?.length ?? 0}
				</span>
			</div>

			<!-- Service list -->
			<div class="flex max-h-72 flex-col gap-2 overflow-y-auto">
				{#if allServicesQuery.isPending}
					<p class="text-xs text-muted-foreground">Loading...</p>
				{:else}
					{#each filteredServices as service (service.id)}
						<div
							class="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5"
							style="border-left: 3px solid {service.colorCode || '#e5e7eb'}"
							role="button"
							tabindex="0"
							onclick={() => toggleService(service.id)}
							onkeydown={(e) => e.key === 'Enter' && toggleService(service.id)}
						>
							<Checkbox checked={selectedIds.has(service.id)} />
							<div class="flex flex-col">
								<span class="text-sm font-medium">{service.title}</span>
								<span class="text-xs text-muted-foreground">
									{service.durationInMins} mins · {service.cost === 0 ? 'Free' : `$${service.cost}`}
								</span>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="ghost" onclick={() => (dialogOpen = false)}>Cancel</Button>
			<Button onclick={handleUpdate} disabled={isPending}>
				{isPending ? 'Updating...' : 'Update'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
