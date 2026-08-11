<script>
	import BookingSetup from '../../../../../modules/settings/booking-preferences/booking-setup/booking-setup.svelte';
	import { authStore } from '$stores/auth.svelte';
	import { routeRolesGuard } from '$utils/routes.roles.guard';

	let currentUserData = $derived(authStore.getPayloadData() ?? null);
</script>

{#if routeRolesGuard(['Platform Owner', 'Business Owner', 'Admin'], currentUserData?.role ?? null)}
	<BookingSetup />
{/if}
