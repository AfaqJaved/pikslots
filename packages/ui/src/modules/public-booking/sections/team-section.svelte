<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import ChevronRight from '@tabler/icons-svelte/icons/chevron-right';
	import FileText from '@tabler/icons-svelte/icons/file-text';
	import type { PublicTeamMember } from '../types';

	let {
		teamMembers,
		bookingPolicyText,
		showPolicy,
		onSelectTeamMember
	}: {
		teamMembers: PublicTeamMember[];
		bookingPolicyText: string;
		showPolicy: boolean;
		onSelectTeamMember: (member: PublicTeamMember) => void;
	} = $props();

	let policyDialogOpen = $state(false);

	function initials(member: PublicTeamMember): string {
		return `${member.name.firstName[0] ?? ''}${member.name.lastName[0] ?? ''}`.toUpperCase();
	}
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-xl font-semibold">Team</h2>

	<div class="grid grid-cols-2 gap-3">
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

	{#if showPolicy && bookingPolicyText}
		<div class="flex flex-col gap-2 border-t pt-4">
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
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Booking policy</Dialog.Title>
				</Dialog.Header>
				<p class="text-sm text-muted-foreground">{bookingPolicyText}</p>
			</Dialog.Content>
		</Dialog.Root>
	{/if}
</div>
