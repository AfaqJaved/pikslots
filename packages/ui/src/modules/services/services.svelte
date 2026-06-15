<script lang="ts">
	import PikslotEmpty from '$lib/components/pikslot-empty.svelte';
	import Briefcase from '@tabler/icons-svelte/icons/briefcase';
	import * as m from '$lib/paraglide/messages.js';
</script>

<PikslotEmpty
	icon={Briefcase}
	title={m.services_empty_title()}
	description={m.services_empty_description()}
	buttonLabel={m.services_empty_button()}
/>
