<script lang="ts">
	import PikslotEmpty from '$lib/components/pikslot-empty.svelte';
	import CalendarSad from '@tabler/icons-svelte/icons/calendar-sad';
	import * as m from '$lib/paraglide/messages.js';
</script>

<PikslotEmpty
	icon={CalendarSad}
	title={m.bookings_empty_title()}
	description={m.bookings_empty_description()}
	buttonLabel={m.bookings_empty_button()}
/>
