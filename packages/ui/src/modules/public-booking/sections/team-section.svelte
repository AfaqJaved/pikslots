<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import ChevronRight from '@tabler/icons-svelte/icons/chevron-right';
	import type { PublicTeamMember } from '../types';

	let {
		teamMembers,
		label,
		onSelectTeamMember
	}: {
		teamMembers: PublicTeamMember[];
		label: string;
		onSelectTeamMember: (member: PublicTeamMember) => void;
	} = $props();

	function initials(member: PublicTeamMember): string {
		return `${member.name.firstName[0] ?? ''}${member.name.lastName[0] ?? ''}`.toUpperCase();
	}
</script>

<div class="flex flex-col gap-4">
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
</div>
