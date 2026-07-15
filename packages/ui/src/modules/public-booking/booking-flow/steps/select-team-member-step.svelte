<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import ChevronRight from '@tabler/icons-svelte/icons/chevron-right';
	import Users from '@tabler/icons-svelte/icons/users';
	import type { PublicTeamMember } from '../../types';

	let {
		teamMembers,
		onSelect
	}: {
		teamMembers: PublicTeamMember[];
		onSelect: (member: PublicTeamMember | null) => void;
	} = $props();

	function initials(member: PublicTeamMember): string {
		return `${member.name.firstName[0] ?? ''}${member.name.lastName[0] ?? ''}`.toUpperCase();
	}
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-lg font-semibold">Select a team member</h2>

	<div class="flex flex-col gap-2">
		<button
			type="button"
			onclick={() => onSelect(null)}
			class="flex cursor-pointer items-center gap-3 border p-3 text-left hover:bg-muted/50"
		>
			<div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
				<Users size={16} class="text-muted-foreground" />
			</div>
			<span class="text-sm font-medium">Any available team member</span>
			<ChevronRight size={16} class="ml-auto shrink-0 text-muted-foreground" />
		</button>

		{#each teamMembers as member (member.id)}
			<button
				type="button"
				onclick={() => onSelect(member)}
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
</div>
