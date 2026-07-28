<script lang="ts">
	import { page } from '$app/state';
	import PublicBookingPage from '../../modules/public-booking/public-booking-page.svelte';
</script>

<PublicBookingPage slug={page.params.businessSlug as string} />
