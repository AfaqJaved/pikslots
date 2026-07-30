<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import ChevronRight from '@tabler/icons-svelte/icons/chevron-right';
	import FileText from '@tabler/icons-svelte/icons/file-text';
	import type { PublicTeamMember } from '../types';
	import Button from '$lib/components/ui/button/button.svelte';

	let {
		teamMembers,
		bookingPolicyText,
		cancellationPolicyValue,
		cancellationPolicyUnit,
		label,
		onSelectTeamMember
	}: {
		teamMembers: PublicTeamMember[];
		bookingPolicyText: string;
		cancellationPolicyValue: number | undefined;
		cancellationPolicyUnit: string | undefined;
		label: string;
		onSelectTeamMember: (member: PublicTeamMember) => void;
	} = $props();

	let policyDialogOpen = $state(false);

	function initials(member: PublicTeamMember): string {
		return `${member.name.firstName[0] ?? ''}${member.name.lastName[0] ?? ''}`.toUpperCase();
	}
</script>

<div class="flex flex-col gap-4 ">
	<h2 class="text-xl font-semibold">{label || 'Team Member'}</h2>

	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
		{#each teamMembers as member (member.id)}
			<button
				type="button"
				onclick={() => onSelectTeamMember(member)}
				class="flex cursor-pointer items-center gap-3 border p-3 text-left hover:bg-muted/50"
			>
				<Avatar.Root>
					{#if member.avatarUrl}
						<Avatar.Image
							src={member.avatarUrl}
							alt="{member.name.firstName} {member.name.lastName}"
						/>
					{/if}
					<Avatar.Fallback>{initials(member)}</Avatar.Fallback>
				</Avatar.Root>
				<span class="text-sm font-medium">{member.name.firstName} {member.name.lastName}</span>
				<ChevronRight size={16} class="ml-auto shrink-0 text-muted-foreground" />
			</button>
		{/each}
	</div>

		<div class="flex flex-col gap-2 border-t pt-4 pb-4">
			<span class="text-xs font-semibold text-muted-foreground">Good to know</span>
			<button
				type="button"
				onclick={() => (policyDialogOpen = true)}
				class="flex w-fit cursor-pointer items-center gap-2 text-sm underline underline-offset-2 hover:text-muted-foreground"
			>
				<FileText size={16} />
			 Booking policy
			</button>
		</div>

		<Dialog.Root bind:open={policyDialogOpen}>
			<Dialog.Content class="sm:max-w-lg md:max-w-xl lg:max-w-xl">
				<Dialog.Header>
					<Dialog.Title class='text-lg font-bold text-white'>Our Booking policy</Dialog.Title>
				</Dialog.Header>
				<p class="text-sm text-muted-foreground">{bookingPolicyText}</p>
				<p class="rounded-xl p-4 text-base shadow-xl" style="background-color: #1a1a1a">
					Cancellation policy You can cancel or reschedule
					{cancellationPolicyUnit
						? `${cancellationPolicyValue == 0 ? '' : cancellationPolicyValue} ${cancellationPolicyUnit}`
						: 'anytime'}
					before the appointment time.
				</p>

				<div class="flex justify-end">
					<Button
						class=" w-fit rounded-full border-2 border-amber-50 bg-transparent px-8 py-4 text-base"
						onclick={() => (policyDialogOpen = false)}>Okay</Button
					>
				</div>
			</Dialog.Content>
		</Dialog.Root>
</div>
