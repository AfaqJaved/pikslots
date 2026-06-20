<script lang="ts">
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import Pencil from '@tabler/icons-svelte/icons/pencil';
	import Trash from '@tabler/icons-svelte/icons/trash';
	import { toast } from 'svelte-sonner';
	import { businessStore } from '$stores/business.svelte';
	import { editCustomerMutationOptions } from '../../api/customer/edit.customer.mutation';
	import type { FullCustomerModel } from '../../api/customer/models/customer-model';

	let { customer }: { customer: FullCustomerModel } = $props();

	let notesValue = $state(customer.notes ?? '');
	let editingNotes = $state(false);

	$effect(() => {
		notesValue = customer.notes ?? '';
		editingNotes = false;
	});

	const queryClient = useQueryClient();

	const saveNotesMutation = createMutation(() => ({
		...editCustomerMutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['customers', businessStore.selectedBusiness?.id]
			});
			queryClient.invalidateQueries({ queryKey: ['customer', customer.id] });
			toast.success('Notes saved');
			editingNotes = false;
		},
		onError: () => toast.error('Failed to save notes')
	}));
</script>

{#if customer.notes && !editingNotes}
	<!-- View mode -->
	<div class="group flex items-center justify-start gap-3">
		<p class="text-sm">{customer.notes}</p>
		<div class="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
			<Button
				variant="ghost"
				size="icon"
				class="size-7"
				onclick={() => {
					notesValue = customer.notes ?? '';
					editingNotes = true;
				}}
			>
				<Pencil class="size-3.5" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				class="size-7 text-destructive hover:text-destructive"
				disabled={saveNotesMutation.isPending}
				onclick={() => {
					if (!businessStore.selectedBusiness?.id) return;
					saveNotesMutation.mutate({
						...customer,
						notes: null,
						businessId: businessStore.selectedBusiness.id
					});
				}}
			>
				<Trash class="size-3.5" />
			</Button>
		</div>
	</div>
{:else}
	<!-- Edit mode -->
	<Textarea bind:value={notesValue} placeholder="Add a note" class="min-h-40 resize-none" />
	<div class="mt-3 flex justify-end gap-2">
		<Button
			variant="ghost"
			size="sm"
			onclick={() => {
				notesValue = customer.notes ?? '';
				editingNotes = false;
			}}
		>
			Cancel
		</Button>
		<Button
			size="sm"
			disabled={saveNotesMutation.isPending}
			onclick={() => {
				if (!businessStore.selectedBusiness?.id) return;
				saveNotesMutation.mutate({
					...customer,
					notes: notesValue || null,
					businessId: businessStore.selectedBusiness.id
				});
			}}
		>
			{saveNotesMutation.isPending ? 'Saving...' : 'Save'}
		</Button>
	</div>
{/if}
