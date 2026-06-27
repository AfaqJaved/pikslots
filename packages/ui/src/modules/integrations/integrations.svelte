<script lang="ts">
	import PikslotEmpty from '$lib/components/pikslot-empty.svelte';
	import Puzzle from '@tabler/icons-svelte/icons/puzzle';
	import * as m from '$lib/paraglide/messages.js';
</script>

<PikslotEmpty
	icon={Puzzle}
	title={m.integrations_empty_title()}
	description={m.integrations_empty_description()}
	buttonLabel={m.integrations_empty_button()}
/>
