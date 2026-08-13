<script>
	import BookingPagePayments from '../../../../../modules/settings/payments/booking-page-payments/booking-page-payments.svelte';
	import { authStore } from '$stores/auth.svelte';
	import { routeRolesGuard } from '$utils/routes.roles.guard';

	let currentUserData = $derived(authStore.getPayloadData() ?? null);
</script>

{#if routeRolesGuard(['Platform Owner', 'Business Owner', 'Admin'], currentUserData?.role ?? null)}
	<BookingPagePayments />
{/if}
