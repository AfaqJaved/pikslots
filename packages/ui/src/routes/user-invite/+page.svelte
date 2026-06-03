<script lang="ts">
	import UserInvite from '../../modules/user-invite/user-invite.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<UserInvite token={data.token} />
