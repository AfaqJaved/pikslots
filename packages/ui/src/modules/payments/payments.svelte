<script lang="ts">
	import PikslotEmpty from '$lib/components/pikslot-empty.svelte';
	import Cash from '@tabler/icons-svelte/icons/cash';
	import * as m from '$lib/paraglide/messages.js';
</script>

<PikslotEmpty
	icon={Cash}
	title={m.payments_empty_title()}
	description={m.payments_empty_description()}
/>
