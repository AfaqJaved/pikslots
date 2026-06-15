<script lang="ts">
	import PikslotEmpty from '$lib/components/pikslot-empty.svelte';
	import UserHeart from '@tabler/icons-svelte/icons/user-heart';
	import * as m from '$lib/paraglide/messages.js';
</script>

<PikslotEmpty
	icon={UserHeart}
	title={m.customers_empty_title()}
	description={m.customers_empty_description()}
	buttonLabel={m.customers_empty_button()}
/>
